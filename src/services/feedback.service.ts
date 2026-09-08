import { db } from "@/db";
import { feedback, NewFeedback, candidateSubmissions, users } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";
import { createAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";

export interface CreateFeedbackInput {
  submissionId: string;
  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  experienceFit: number;
  strengths?: string;
  concerns?: string;
  comments?: string;
  recommendation: "PROCEED_TO_INTERVIEW" | "REJECT" | "KEEP_ON_HOLD" | "PROCEED_TO_NEXT_ROUND";
}

export async function addCandidateFeedback(
  input: CreateFeedbackInput,
  userId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null
) {
  const conditions = [eq(candidateSubmissions.id, input.submissionId)];
  if (userRole === "VENDOR" && userVendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, userVendorId));
  }

  const sub = await db.query.candidateSubmissions.findFirst({
    where: and(...conditions),
    with: {
      candidate: true,
      job: true,
    },
  });

  if (!sub) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN: Candidate submission not found or vendor access denied.");
  }

  const feedbackId = randomUUID();
  const newFeedback: NewFeedback = {
    id: feedbackId,
    submissionId: input.submissionId,
    overallRating: Math.min(5, Math.max(1, input.overallRating)),
    technicalRating: Math.min(5, Math.max(1, input.technicalRating)),
    communicationRating: Math.min(5, Math.max(1, input.communicationRating)),
    experienceFit: Math.min(5, Math.max(1, input.experienceFit)),
    strengths: input.strengths || null,
    concerns: input.concerns || null,
    comments: input.comments || null,
    recommendation: input.recommendation,
    submittedBy: userId,
  };

  await db.transaction(async (tx) => {
    await tx.insert(feedback).values(newFeedback);

    await createAuditLog(
      {
        userId,
        action: "ADD_FEEDBACK",
        entityType: "Feedback",
        entityId: feedbackId,
        newValue: newFeedback,
      },
      tx
    );

    if (userRole === "VENDOR") {
      const admins = await tx.query.users.findMany({ where: eq(users.role, "ADMIN") });
      for (const admin of admins) {
        await createNotification(
          {
            userId: admin.id,
            title: `Feedback Submitted: ${sub.candidate.name}`,
            message: `Vendor submitted new candidate feedback for '${sub.candidate.name}' on job '${sub.job.title}'.`,
            link: `/admin/submissions/${input.submissionId}`,
            type: "INFO",
          },
          tx
        );
      }
    }
  });

  return feedbackId;
}

export async function getFeedbackForSubmission(
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
  });

  if (!sub) {
    throw new Error("NOT_FOUND_OR_FORBIDDEN");
  }

  return await db.query.feedback.findMany({
    where: eq(feedback.submissionId, submissionId),
    orderBy: [desc(feedback.createdAt)],
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
