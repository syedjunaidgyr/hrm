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
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { createAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";
import { getStorageProvider } from "./storage.service";
import { getAllowedTransitions } from "./status.service";
import { getNotifiableClientUsers } from "@/lib/auth/project-scope";
import { sendEmail } from "./email.service";

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
    status: "NEW",
    submittedBy: adminUserId,
  };

  const initialStatusHistory: NewStatusHistory = {
    id: randomUUID(),
    submissionId,
    fromStatus: "INITIAL",
    toStatus: "NEW",
    reason: "CV uploaded and submitted to Job Description by Admin",
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
  });

  // In-app notify only users scoped to this JD's project
  const notifiable = await getNotifiableClientUsers(job.vendorId, job.projectId);
  for (const vUser of notifiable) {
    await createNotification({
      userId: vUser.id,
      title: "New Candidate Submission Received",
      message: `A new candidate has been submitted for job ${job.title} (${job.jobCode}).`,
      link: `/vendor/candidates/${submissionId}`,
      type: "INFO",
    });
  }

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

  const allowed = await getAllowedTransitions("CANDIDATE", sub.status, userVendorId);
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
  });

  if (userRole === "VENDOR") {
    const admins = await db.query.users.findMany({ where: eq(users.role, "ADMIN") });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: `Candidate Status Updated: ${sub.candidate.name}`,
        message: `Client updated candidate ${sub.candidate.name} status on '${sub.job.title}' to ${newStatus}.`,
        link: `/admin/submissions/${submissionId}`,
        type: "INFO",
      });
    }
  } else {
    const notifiable = await getNotifiableClientUsers(sub.vendorId, sub.job.projectId);
    for (const vUser of notifiable) {
      await createNotification({
        userId: vUser.id,
        title: `Candidate Status Updated: ${sub.candidate.name}`,
        message: `Status for candidate ${sub.candidate.name} on '${sub.job.title}' was updated to ${newStatus}.`,
        link: `/vendor/candidates/${submissionId}`,
        type: "INFO",
      });
    }
  }

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
  projectIds?: string[] | null;
  restrictToProjects?: boolean;
}) {
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  if (options.restrictToProjects && (!options.projectIds || options.projectIds.length === 0)) {
    return { submissions: [], total: 0, page, limit, totalPages: 0 };
  }

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

  let [items, totalCount] = await Promise.all([
    db.query.candidateSubmissions.findMany({
      where: whereClause,
      limit: options.restrictToProjects ? 500 : limit,
      offset: options.restrictToProjects ? 0 : offset,
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

  if (options.restrictToProjects && options.projectIds) {
    const allowed = new Set(options.projectIds);
    items = items.filter((s) => s.job?.projectId && allowed.has(s.job.projectId));
    totalCount = items.length;
    items = items.slice(offset, offset + limit);
  }

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
  userVendorId?: string | null,
  projectScope?: { all: boolean; projectIds: string[] }
) {
  const conditions = [eq(candidateSubmissions.id, submissionId)];
  if (userRole === "VENDOR" && userVendorId) {
    conditions.push(eq(candidateSubmissions.vendorId, userVendorId));
  }

  const sub = await db.query.candidateSubmissions.findFirst({
    where: and(...conditions),
    with: {
      job: { with: { vendor: true, project: true } },
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

  if (projectScope && !projectScope.all) {
    const pid = sub.job?.projectId;
    if (!pid || !projectScope.projectIds.includes(pid)) {
      throw new Error("NOT_FOUND_OR_FORBIDDEN: Submission not found or vendor access denied.");
    }
  }

  return sub;
}

export async function getResumeStreamForDownload(
  fileId: string,
  userId: string,
  userRole: "ADMIN" | "VENDOR",
  userVendorId?: string | null,
  projectScope?: { all: boolean; projectIds: string[] }
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
      with: { job: true },
    });
    if (!sub) {
      throw new Error("FORBIDDEN: You do not have access to download this resume.");
    }
    if (projectScope && !projectScope.all) {
      const pid = sub.job?.projectId;
      if (!pid || !projectScope.projectIds.includes(pid)) {
        throw new Error("FORBIDDEN: You do not have access to download this resume.");
      }
    }
    if (sub.status === "NEW") {
      await db.transaction(async (tx) => {
        await tx
          .update(candidateSubmissions)
          .set({ status: "VIEWED" })
          .where(eq(candidateSubmissions.id, sub.id));
        await tx.insert(statusHistory).values({
          id: randomUUID(),
          submissionId: sub.id,
          fromStatus: "NEW",
          toStatus: "VIEWED",
          reason: "CV opened/downloaded by client",
          changedBy: userId,
        });
      });
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

/** Notify client users by email about selected CV submissions. */
export async function notifyClientOfSubmissions(
  submissionIds: string[],
  adminUserId: string
) {
  if (!submissionIds.length) {
    throw new Error("NO_SUBMISSIONS_SELECTED");
  }

  const subs = await db.query.candidateSubmissions.findMany({
    where: inArray(candidateSubmissions.id, submissionIds),
    with: {
      candidate: true,
      job: { with: { project: true, vendor: true } },
      vendor: true,
    },
  });

  if (!subs.length) {
    throw new Error("NO_SUBMISSIONS_FOUND");
  }

  // Group by vendor + project for separate emails if mixed
  const groups = new Map<string, typeof subs>();
  for (const sub of subs) {
    const key = `${sub.vendorId}::${sub.job?.projectId || "none"}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(sub);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginLink = `${appUrl}/login?next=/vendor/jobs`;
  const results: { emailed: number; inApp: number; group: string }[] = [];

  for (const [key, groupSubs] of groups) {
    const first = groupSubs[0];
    const vendorId = first.vendorId;
    const projectId = first.job?.projectId || null;

    const notifiable = await getNotifiableClientUsers(vendorId, projectId);
    let toEmails = notifiable.map((u) => u.email).filter(Boolean);

    // Fallback: project contact, then client contact
    if (toEmails.length === 0) {
      const projectEmail = first.job?.project?.contactEmail;
      const vendorEmail = first.vendor?.contactEmail || first.job?.vendor?.contactEmail;
      if (projectEmail) toEmails = [projectEmail];
      else if (vendorEmail) toEmails = [vendorEmail];
    }

    const rows = groupSubs
      .map(
        (s) =>
          `<tr>
            <td style="padding:8px;border:1px solid #e2e8f0;">${s.candidate.name}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${s.job.jobCode}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${s.job.title}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${s.job.project?.name || "—"}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;color:#1e1e1e;">
        <h2>New CVs submitted — Rightfit</h2>
        <p>The following candidate CVs have been submitted for your review:</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Candidate</th>
              <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">JD Code</th>
              <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Job Title</th>
              <th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">Project</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:24px;">
          <a href="${loginLink}" style="background:#1E1E1E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Login to view CVs
          </a>
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:16px;">Or open: ${loginLink}</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: toEmails,
      subject: `New CVs submitted — ${first.job.title} (${first.job.jobCode})`,
      html,
    });

    for (const u of notifiable) {
      await createNotification({
        userId: u.id,
        title: "New CVs ready for review",
        message: `${groupSubs.length} CV(s) submitted for ${first.job.title} (${first.job.jobCode}).`,
        link: `/vendor/jobs`,
        type: "ACTION",
      });
    }

    const now = new Date();
    await db
      .update(candidateSubmissions)
      .set({ notifiedAt: now })
      .where(
        inArray(
          candidateSubmissions.id,
          groupSubs.map((s) => s.id)
        )
      );

    await createAuditLog({
      userId: adminUserId,
      action: "NOTIFY_CLIENT",
      entityType: "CandidateSubmission",
      entityId: groupSubs[0].id,
      newValue: {
        submissionIds: groupSubs.map((s) => s.id),
        to: toEmails,
        emailed: emailResult.sent,
      },
    });

    results.push({
      emailed: emailResult.sent ? toEmails.length : 0,
      inApp: notifiable.length,
      group: key,
    });
  }

  return { success: true, results };
}
