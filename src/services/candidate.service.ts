import { db } from "@/db";
import {
  candidates,
  NewCandidate,
  files,
  NewFileRecord,
  candidateSubmissions,
  feedback,
  statusHistory,
  comments,
} from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, or, like, sql, desc, and, inArray } from "drizzle-orm";
import { getStorageProvider, getStorageProviderName, removeStoredFile } from "./storage.service";
import { createAuditLog } from "./audit.service";

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

function assertResumeFileName(fileName: string) {
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_RESUME_EXTENSIONS.includes(ext)) {
    throw new Error("INVALID_FILE_TYPE: Only PDF, DOC, and DOCX resume formats are supported.");
  }
  return ext;
}

export interface CreateCandidateInput {
  name: string;
  email: string;
  phone: string;
  totalExperience: string;
  relevantExperience: string;
  currentCompany?: string;
  currentDesignation?: string;
  currentLocation?: string;
  preferredLocation?: string;
  skills: string;
  noticePeriod?: string;
  currentSalary?: string;
  expectedSalary?: string;
  source?: string;
  recruiter?: string;
  notes?: string;
  resumeBuffer: Buffer;
  resumeFileName: string;
  mimeType: string;
}

export async function createCandidate(input: CreateCandidateInput, adminUserId: string) {
  const candidateId = randomUUID();
  const fileId = randomUUID();

  assertResumeFileName(input.resumeFileName);

  const storageKey = `resumes/${candidateId}/${randomUUID()}-${input.resumeFileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storageProvider = getStorageProvider();
  await storageProvider.upload(input.resumeBuffer, storageKey);

  const newCandidate: NewCandidate = {
    id: candidateId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    totalExperience: input.totalExperience || "0.0",
    relevantExperience: input.relevantExperience || "0.0",
    currentCompany: input.currentCompany || null,
    currentDesignation: input.currentDesignation || null,
    currentLocation: input.currentLocation || null,
    preferredLocation: input.preferredLocation || null,
    skills: input.skills,
    noticePeriod: input.noticePeriod || null,
    currentSalary: input.currentSalary || null,
    expectedSalary: input.expectedSalary || null,
    source: input.source || null,
    recruiter: input.recruiter || null,
    notes: input.notes || null,
    createdBy: adminUserId,
  };

  const newFile: NewFileRecord = {
    id: fileId,
    candidateId,
    submissionId: null,
    fileName: input.resumeFileName,
    storageKey,
    storageProvider: getStorageProviderName(),
    mimeType: input.mimeType,
    fileSize: input.resumeBuffer.length,
    uploadedBy: adminUserId,
  };

  await db.transaction(async (tx) => {
    await tx.insert(candidates).values(newCandidate);
    await tx.insert(files).values(newFile);

    await createAuditLog(
      {
        userId: adminUserId,
        action: "CREATE_CANDIDATE",
        entityType: "Candidate",
        entityId: candidateId,
        newValue: newCandidate,
      },
      tx
    );

    await createAuditLog(
      {
        userId: adminUserId,
        action: "UPLOAD_RESUME",
        entityType: "File",
        entityId: fileId,
        newValue: newFile,
      },
      tx
    );
  });

  return { candidateId, fileId };
}

export async function getCandidates(options: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(
      or(
        like(candidates.name, term),
        like(candidates.email, term),
        like(candidates.phone, term),
        like(candidates.skills, term),
        like(candidates.currentCompany, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalCount] = await Promise.all([
    db.query.candidates.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(candidates.createdAt)],
      with: {
        files: true,
        submissions: {
          with: {
            job: true,
            vendor: true,
          },
        },
      },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(whereClause)
      .then((res) => Number(res[0]?.count || 0)),
  ]);

  return {
    candidates: items,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getCandidateById(candidateId: string) {
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, candidateId),
    with: {
      files: true,
      submissions: {
        with: {
          job: { with: { vendor: true } },
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
      },
    },
  });

  if (!candidate) {
    throw new Error("CANDIDATE_NOT_FOUND");
  }

  return candidate;
}

export async function replaceCandidateResume(
  candidateId: string,
  input: { resumeBuffer: Buffer; resumeFileName: string; mimeType: string },
  adminUserId: string
) {
  assertResumeFileName(input.resumeFileName);

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, candidateId),
    with: { files: true },
  });
  if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");

  const storageKey = `resumes/${candidateId}/${randomUUID()}-${input.resumeFileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storageProviderName = getStorageProviderName();
  await getStorageProvider().upload(input.resumeBuffer, storageKey);

  const existing = candidate.files[0];

  if (existing) {
    const oldKey = existing.storageKey;
    const oldProvider = existing.storageProvider;
    await db
      .update(files)
      .set({
        fileName: input.resumeFileName,
        storageKey,
        storageProvider: storageProviderName,
        mimeType: input.mimeType,
        fileSize: input.resumeBuffer.length,
        uploadedBy: adminUserId,
      })
      .where(eq(files.id, existing.id));

    await removeStoredFile(oldKey, oldProvider);
    await createAuditLog({
      userId: adminUserId,
      action: "REPLACE_RESUME",
      entityType: "File",
      entityId: existing.id,
      oldValue: { fileName: existing.fileName, storageKey: oldKey },
      newValue: { fileName: input.resumeFileName, storageKey },
    });
    return { fileId: existing.id };
  }

  const fileId = randomUUID();
  await db.insert(files).values({
    id: fileId,
    candidateId,
    submissionId: null,
    fileName: input.resumeFileName,
    storageKey,
    storageProvider: storageProviderName,
    mimeType: input.mimeType,
    fileSize: input.resumeBuffer.length,
    uploadedBy: adminUserId,
  });
  await createAuditLog({
    userId: adminUserId,
    action: "UPLOAD_RESUME",
    entityType: "File",
    entityId: fileId,
    newValue: { fileName: input.resumeFileName, storageKey },
  });
  return { fileId };
}

export async function deleteCandidateResume(candidateId: string, adminUserId: string, fileId?: string) {
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, candidateId),
    with: { files: true },
  });
  if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");

  const file = fileId ? candidate.files.find((f) => f.id === fileId) : candidate.files[0];
  if (!file) throw new Error("RESUME_NOT_FOUND: No resume file to delete.");

  const attached = await db.query.candidateSubmissions.findFirst({
    where: eq(candidateSubmissions.resumeFileId, file.id),
  });
  if (attached) {
    throw new Error(
      "RESUME_IN_USE: This resume is attached to a job submission. Replace the resume instead of deleting it, or delete the candidate."
    );
  }

  await removeStoredFile(file.storageKey, file.storageProvider);
  await db.delete(files).where(eq(files.id, file.id));
  await createAuditLog({
    userId: adminUserId,
    action: "DELETE_RESUME",
    entityType: "File",
    entityId: file.id,
    oldValue: { fileName: file.fileName, storageKey: file.storageKey, candidateId },
  });
}

export async function deleteCandidate(candidateId: string, adminUserId: string) {
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, candidateId),
    with: {
      files: true,
      submissions: { columns: { id: true } },
    },
  });
  if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");

  const submissionIds = candidate.submissions.map((s) => s.id);

  await db.transaction(async (tx) => {
    if (submissionIds.length > 0) {
      await tx.delete(feedback).where(inArray(feedback.submissionId, submissionIds));
      await tx.delete(statusHistory).where(inArray(statusHistory.submissionId, submissionIds));
      await tx.delete(comments).where(inArray(comments.submissionId, submissionIds));
      await tx.delete(candidateSubmissions).where(eq(candidateSubmissions.candidateId, candidateId));
    }

    if (candidate.files.length > 0) {
      await tx.delete(files).where(eq(files.candidateId, candidateId));
    }

    await tx.delete(candidates).where(eq(candidates.id, candidateId));

    await createAuditLog(
      {
        userId: adminUserId,
        action: "DELETE_CANDIDATE",
        entityType: "Candidate",
        entityId: candidateId,
        oldValue: { name: candidate.name, email: candidate.email },
      },
      tx
    );
  });

  for (const file of candidate.files) {
    await removeStoredFile(file.storageKey, file.storageProvider);
  }
}
