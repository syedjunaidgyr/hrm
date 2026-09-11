import { db } from "@/db";
import { jobDescriptions, NewJobDescription, JobDescription, users } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, and, like, or, sql, desc, inArray } from "drizzle-orm";
import { createAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";

export interface CreateJobInput {
  title: string;
  department?: string;
  disciplineId?: string | null;
  projectId?: string | null;
  location: string;
  employmentType: string;
  workMode: string;
  minExperience: number;
  maxExperience: number;
  numPositions: number;
  minSalary?: string;
  maxSalary?: string;
  requiredSkills: string;
  preferredSkills?: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  education?: string;
  noticePeriod?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  targetJoiningDate?: string;
  dateReceived?: string;
  dateClosed?: string;
  additionalNotes?: string;
  status: string;
}

export async function createJob(input: CreateJobInput, userId: string, vendorId: string) {
  const jobId = randomUUID();
  const jobCode = `JOB-${vendorId.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newJob: NewJobDescription = {
    id: jobId,
    vendorId,
    jobCode,
    projectId: input.projectId || null,
    disciplineId: input.disciplineId || null,
    title: input.title,
    department: input.department || null,
    location: input.location,
    employmentType: input.employmentType || "FULL_TIME",
    workMode: input.workMode || "ON_SITE",
    minExperience: input.minExperience || 0,
    maxExperience: input.maxExperience || 0,
    numPositions: input.numPositions || 1,
    minSalary: input.minSalary || null,
    maxSalary: input.maxSalary || null,
    requiredSkills: input.requiredSkills,
    preferredSkills: input.preferredSkills || null,
    description: input.description,
    responsibilities: input.responsibilities || null,
    requirements: input.requirements || null,
    education: input.education || null,
    noticePeriod: input.noticePeriod || null,
    priority: input.priority || "MEDIUM",
    targetJoiningDate: input.targetJoiningDate ? (input.targetJoiningDate as any) : null,
    dateReceived: input.dateReceived ? (input.dateReceived as any) : null,
    dateClosed: input.dateClosed ? (input.dateClosed as any) : null,
    additionalNotes: input.additionalNotes || null,
    status: input.status,
    createdBy: userId,
  };

  await db.transaction(async (tx) => {
    await tx.insert(jobDescriptions).values(newJob);

    await createAuditLog(
      {
        userId,
        action: input.status === "SUBMITTED" ? "SUBMIT_JD" : "CREATE_JD",
        entityType: "JobDescription",
        entityId: jobId,
        newValue: newJob,
      },
      tx
    );

    if (input.status === "SUBMITTED") {
      const adminUsers = await tx.query.users.findMany({
        where: eq(users.role, "ADMIN"),
      });
      for (const admin of adminUsers) {
        await createNotification(
          {
            userId: admin.id,
            title: "New Job Description Submitted",
            message: `Job '${input.title}' (${jobCode}) has been submitted for recruitment.`,
            link: `/admin/jobs/${jobId}`,
            type: "INFO",
          },
          tx
        );
      }
    }
  });

  return jobId;
}

export async function updateJob(
  jobId: string,
  input: Partial<CreateJobInput>,
  userId: string,
  vendorId?: string | null
) {
  const conditions = [eq(jobDescriptions.id, jobId)];
  if (vendorId) {
    conditions.push(eq(jobDescriptions.vendorId, vendorId));
  }

  const existingJob = await db.query.jobDescriptions.findFirst({
    where: and(...conditions),
  });

  if (!existingJob) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN");
  }

  const updateData: Partial<NewJobDescription> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.department !== undefined) updateData.department = input.department;
  if (input.disciplineId !== undefined) updateData.disciplineId = input.disciplineId;
  if (input.projectId !== undefined) updateData.projectId = input.projectId;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.employmentType !== undefined) updateData.employmentType = input.employmentType;
  if (input.workMode !== undefined) updateData.workMode = input.workMode;
  if (input.minExperience !== undefined) updateData.minExperience = input.minExperience;
  if (input.maxExperience !== undefined) updateData.maxExperience = input.maxExperience;
  if (input.numPositions !== undefined) updateData.numPositions = input.numPositions;
  if (input.minSalary !== undefined) updateData.minSalary = input.minSalary;
  if (input.maxSalary !== undefined) updateData.maxSalary = input.maxSalary;
  if (input.requiredSkills !== undefined) updateData.requiredSkills = input.requiredSkills;
  if (input.preferredSkills !== undefined) updateData.preferredSkills = input.preferredSkills;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.responsibilities !== undefined) updateData.responsibilities = input.responsibilities;
  if (input.requirements !== undefined) updateData.requirements = input.requirements;
  if (input.education !== undefined) updateData.education = input.education;
  if (input.noticePeriod !== undefined) updateData.noticePeriod = input.noticePeriod;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.dateReceived !== undefined) updateData.dateReceived = input.dateReceived as any;
  if (input.dateClosed !== undefined) updateData.dateClosed = input.dateClosed as any;
  if (input.additionalNotes !== undefined) updateData.additionalNotes = input.additionalNotes;

  await db.transaction(async (tx) => {
    await tx.update(jobDescriptions).set(updateData).where(and(...conditions));

    await createAuditLog(
      {
        userId,
        action: input.status === "SUBMITTED" ? "SUBMIT_JD" : "UPDATE_JD",
        entityType: "JobDescription",
        entityId: jobId,
        oldValue: existingJob,
        newValue: { ...existingJob, ...updateData },
      },
      tx
    );
  });
}

export async function getJobs(options: {
  vendorId?: string | null;
  status?: string;
  priority?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  /** When set, only return JDs whose projectId is in this list. Empty array => no rows. */
  projectIds?: string[] | null;
  /** If true with projectIds empty, return no jobs (project-scoped user with no assignments). */
  restrictToProjects?: boolean;
}) {
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (options.vendorId) {
    conditions.push(eq(jobDescriptions.vendorId, options.vendorId));
  }

  if (options.restrictToProjects) {
    if (!options.projectIds || options.projectIds.length === 0) {
      return { jobs: [], total: 0, page, limit, totalPages: 0 };
    }
    conditions.push(inArray(jobDescriptions.projectId, options.projectIds));
  }

  if (options.status && options.status !== "ALL") {
    conditions.push(eq(jobDescriptions.status, options.status));
  }

  if (options.priority && options.priority !== "ALL") {
    conditions.push(eq(jobDescriptions.priority, options.priority));
  }

  if (options.location) {
    conditions.push(like(jobDescriptions.location, `%${options.location}%`));
  }

  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(
      or(
        like(jobDescriptions.title, term),
        like(jobDescriptions.jobCode, term),
        like(jobDescriptions.department, term),
        like(jobDescriptions.requiredSkills, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalCount] = await Promise.all([
    db.query.jobDescriptions.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(jobDescriptions.createdAt)],
      with: {
        vendor: true,
        project: true,
        discipline: true,
        submissions: {
          columns: { id: true, status: true, notifiedAt: true },
          with: {
            candidate: {
              columns: { id: true, name: true, currentDesignation: true },
            },
            resumeFile: {
              columns: { id: true, fileName: true },
            },
          },
        },
      },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(jobDescriptions)
      .where(whereClause)
      .then((res) => Number(res[0]?.count || 0)),
  ]);

  return {
    jobs: items,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getJobById(
  jobId: string,
  vendorId?: string | null,
  projectScope?: { all: boolean; projectIds: string[] }
) {
  const conditions = [eq(jobDescriptions.id, jobId)];
  if (vendorId) {
    conditions.push(eq(jobDescriptions.vendorId, vendorId));
  }

  const job = await db.query.jobDescriptions.findFirst({
    where: and(...conditions),
    with: {
      vendor: true,
      project: true,
      discipline: true,
      submissions: {
        with: {
          candidate: true,
          resumeFile: true,
          feedbackList: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN");
  }

  if (projectScope && !projectScope.all) {
    if (!job.projectId || !projectScope.projectIds.includes(job.projectId)) {
      throw new Error("NOT_FOUND_OR_FORBIDDEN");
    }
  }

  return job;
}
