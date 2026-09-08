import { db } from "@/db";
import {
  candidateSubmissions,
  NewCandidateSubmission,
  statusHistory,
  NewStatusHistory,
  comments,
  jobDescriptions,
  files,
  users,
} from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, and, sql, desc } from "drizzle-orm";
import { createAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";
import { getStorageProvider } from "./storage.service";

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "SHORTLISTED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  UNDER_REVIEW: ["SHORTLISTED", "INTERVIEW_SCHEDULED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEW_SCHEDULED", "FEEDBACK_PENDING", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  FEEDBACK_PENDING: ["INTERVIEW_SCHEDULED", "INTERVIEWED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  INTERVIEW_SCHEDULED: ["INTERVIEWED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  INTERVIEWED: ["SELECTED", "SHORTLISTED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  SELECTED: ["OFFER_RELEASED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  OFFER_RELEASED: ["OFFER_ACCEPTED", "REJECTED", "ON_HOLD", "WITHDRAWN"],
  OFFER_ACCEPTED: ["JOINED", "WITHDRAWN"],
  ON_HOLD: ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "REJECTED", "WITHDRAWN"],
  REJECTED: ["UNDER_REVIEW"],
  WITHDRAWN: [],
  JOINED: [],
};

export async function submitCandidateToJob(
  jobId: string,
  candidateId: string,
  resumeFileId: string,
  adminUserId: string
) {
  const job = await db.query.jobDescriptions.findFirst({
    where: eq(jobDescriptions.id, jobId),
  });

  if (!job) {
    throw new Error("JOB_NOT_FOUND");
  }

  const existingSub = await db.query.candidateSubmissions.findFirst({
    where: and(
      eq(candidateSubmissions.jobId, jobId),
      eq(candidateSubmissions.candidateId, candidateId)
    ),
  });

  if (existingSub) {
    throw new Error("DUPLICATE_SUBMISSION: Candidate has already been submitted to this Job Description.");
  }

  const submissionId = randomUUID();
  const newSub: NewCandidateSubmission = {
    id: submissionId,
    jobId,
    candidateId,
    vendorId: job.vendorId,
    resumeFileId,
    status: "SUBMITTED",
    submittedBy: adminUserId,
  };

  const initialStatusHistory: NewStatusHistory = {
    id: randomUUID(),
    submissionId,
    fromStatus: "INITIAL",
    toStatus: "SUBMITTED",
    reason: "Submitted against Job Description by Admin",
    changedBy: adminUserId,
  };

  await db.transaction(async (tx) => {
    await tx.insert(candidateSubmissions).values(newSub);
    await tx.insert(statusHistory).values(initialStatusHistory);

    await tx.update(files).set({ submissionId }).where(eq(files.id, resumeFileId));

    await createAuditLog(
      {
        userId: adminUserId,
        action: "SUBMIT_CANDIDATE",
        entityType: "CandidateSubmission",
        entityId: submissionId,
        newValue: newSub,
      },
      tx
    );

    const vendorUsers = await tx.query.users.findMany({
      where: and(eq(users.vendorId, job.vendorId), eq(users.role, "VENDOR")),
    });

    for (const vUser of vendorUsers) {
      await createNotification(
        {
          userId: vUser.id,
          title: "New Candidate Submission Received",
          message: `A new candidate has been submitted for job ${job.title} (${job.jobCode}).`,
          link: `/vendor/candidates/${submissionId}`,
          type: "INFO",
        },
        tx
      );
    }
  });

  return submissionId;
}

export async function updateCandidateSubmissionStatus(
  submissionId: string,
  newStatus: string,
  reason: string,
  userId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null
) {
  const conditions = [eq(candidateSubmissions.id, submissionId)];
  if (userRole === "VENDOR" && userVendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, userVendorId));
  }

  const sub = await db.query.candidateSubmissions.findFirst({
    where: and(...conditions),
    with: {
      job: true,
      candidate: true,
    },
  });

  if (!sub) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN: Candidate submission not found or vendor access denied.");
  }

  const allowed = VALID_TRANSITIONS[sub.status] || [];
  if (userRole !== "ADMIN" && !allowed.includes(newStatus)) {
    throw new Error(
      `INVALID_STATUS_TRANSITION: Cannot transition candidate submission status from '${sub.status}' to '${newStatus}'.`
    );
  }

  const oldStatus = sub.status;
  const historyId = randomUUID();

  await db.transaction(async (tx) => {
    await tx
      .update(candidateSubmissions)
      .set({ status: newStatus })
      .where(and(...conditions));

    await tx.insert(statusHistory).values({
      id: historyId,
      submissionId,
      fromStatus: oldStatus,
      toStatus: newStatus,
      reason: reason || `Status updated to ${newStatus} by ${userRole}`,
      changedBy: userId,
    });

    await createAuditLog(
      {
        userId,
        action: "UPDATE_CANDIDATE_STATUS",
        entityType: "CandidateSubmission",
        entityId: submissionId,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus, reason },
      },
      tx
    );

    if (userRole === "VENDOR") {
      const admins = await tx.query.users.findMany({ where: eq(users.role, "ADMIN") });
      for (const admin of admins) {
        await createNotification(
          {
            userId: admin.id,
            title: `Candidate Status Updated: ${sub.candidate.name}`,
            message: `Vendor updated candidate ${sub.candidate.name} status on '${sub.job.title}' to ${newStatus}.`,
            link: `/admin/submissions/${submissionId}`,
            type: "INFO",
          },
          tx
        );
      }
    } else {
      const vUsers = await tx.query.users.findMany({
        where: and(eq(users.vendorId, sub.vendorId), eq(users.role, "VENDOR")),
      });
      for (const vUser of vUsers) {
        await createNotification(
          {
            userId: vUser.id,
            title: `Candidate Status Updated: ${sub.candidate.name}`,
            message: `Status for candidate ${sub.candidate.name} on '${sub.job.title}' was updated to ${newStatus}.`,
            link: `/vendor/candidates/${submissionId}`,
            type: "INFO",
          },
          tx
        );
      }
    }
  });

  return { success: true, oldStatus, newStatus };
}

export async function addCommentToSubmission(
  submissionId: string,
  commentText: string,
  userId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null
) {
  const conditions = [eq(candidateSubmissions.id, submissionId)];
  if (userRole === "VENDOR" && userVendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, userVendorId));
  }

  const sub = await db.query.candidateSubmissions.findFirst({
    where: and(...conditions),
  });

  if (!sub) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN");
  }

  const commentId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(comments).values({
      id: commentId,
      submissionId,
      userId,
      comment: commentText,
    });

    await createAuditLog(
      {
        userId,
        action: "ADD_COMMENT",
        entityType: "Comment",
        entityId: commentId,
        newValue: { submissionId, commentText },
      },
      tx
    );
  });

  return commentId;
}

export async function getSubmissions(options: {
  vendorId?: string | null;
  status?: string;
  jobId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (options.vendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, options.vendorId));
  }

  if (options.status && options.status !== "ALL") {
    conditions.push(eq(candidateSubmissions.status, options.status));
  }

  if (options.jobId) {
    conditions.push(eq(candidateSubmissions.jobId, options.jobId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalCount] = await Promise.all([
    db.query.candidateSubmissions.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(candidateSubmissions.createdAt)],
      with: {
        job: true,
        candidate: true,
        vendor: true,
        resumeFile: true,
        feedbackList: {
          orderBy: (tb, { desc }) => [desc(tb.createdAt)],
          limit: 1,
        },
      },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(candidateSubmissions)
      .where(whereClause)
      .then((res) => Number(res[0]?.count || 0)),
  ]);

  return {
    submissions: items,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getSubmissionById(
  submissionId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null
) {
  const conditions = [eq(candidateSubmissions.id, submissionId)];
  if (userRole === "VENDOR" && userVendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, userVendorId));
  }

  const sub = await db.query.candidateSubmissions.findFirst({
    where: and(...conditions),
    with: {
      job: { with: { vendor: true } },
      candidate: true,
      vendor: true,
      resumeFile: true,
      feedbackList: {
        orderBy: (tb, { desc }) => [desc(tb.createdAt)],
        with: { author: true },
      },
      statusHistoryList: {
        orderBy: (tb, { desc }) => [desc(tb.createdAt)],
        with: { user: true },
      },
      commentsList: {
        orderBy: (tb, { desc }) => [desc(tb.createdAt)],
        with: { user: true },
      },
    },
  });

  if (!sub) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN: Submission not found or vendor access denied.");
  }

  return sub;
}

export async function getResumeStreamForDownload(
  fileId: string,
  userId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null
) {
  const fileRecord = await db.query.files.findFirst({
    where: eq(files.id, fileId),
  });

  if (!fileRecord) {
    throw new Error("FILE_NOT_FOUND");
  }

  if (userRole === "VENDOR" && userVendorId) {
    const sub = await db.query.candidateSubmissions.findFirst({
      where: and(
        eq(candidateSubmissions.resumeFileId, fileId),
        eq(candidateSubmissions.vendorId, userVendorId)
      ),
    });
    if (!sub) {
      throw new Error("FORBIDDEN: You do not have access to download this resume.");
    }
  }

  const storageProvider = getStorageProvider();
  const stream = await storageProvider.getStream(fileRecord.storageKey);

  await createAuditLog({
    userId,
    action: "DOWNLOAD_RESUME",
    entityType: "File",
    entityId: fileId,
  });

  return { stream, fileRecord };
}
