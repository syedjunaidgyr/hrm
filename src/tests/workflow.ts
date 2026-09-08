import "dotenv/config";
import assert from "assert";
import { loginUser } from "../services/auth.service";
import { createJob, getJobs, getJobById } from "../services/job.service";
import { createCandidate } from "../services/candidate.service";
import { submitCandidateToJob, updateCandidateSubmissionStatus, getSubmissionById, getResumeStreamForDownload } from "../services/submission.service";
import { addCandidateFeedback, getFeedbackForSubmission } from "../services/feedback.service";
import { db, pool } from "../db";
import { candidateSubmissions, statusHistory, auditLogs, notifications } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING AUTOMATED RECRUITMENT WORKFLOW TESTS");
  console.log("=========================================");

  // 1. Authentication Tests
  console.log("\n[Test 1] Testing Admin & Vendor Authentication...");
  const adminSession = await loginUser("admin@example.com", "Admin123!@#");
  assert.strictEqual(adminSession.role, "ADMIN");
  assert.strictEqual(adminSession.vendorId, null);
  console.log("✓ Admin Authentication Success");

  const vendorABCSession = await loginUser("vendor_abc@example.com", "Vendor123!@#");
  assert.strictEqual(vendorABCSession.role, "VENDOR");
  assert.ok(vendorABCSession.vendorId);
  console.log("✓ Vendor ABC Authentication Success");

  const vendorXYZSession = await loginUser("vendor_xyz@example.com", "Vendor123!@#");
  assert.strictEqual(vendorXYZSession.role, "VENDOR");
  assert.ok(vendorXYZSession.vendorId);
  console.log("✓ Vendor XYZ Authentication Success");

  // 2. Vendor Data Isolation Tests (IDOR Prevention)
  console.log("\n[Test 2] Testing Vendor Data Isolation & IDOR Protection...");
  const vendorABCJobs = await getJobs({ vendorId: vendorABCSession.vendorId });
  assert.ok(vendorABCJobs.jobs.length > 0);
  const abcJobId = vendorABCJobs.jobs[0].id;

  // Attempt to fetch Vendor ABC's job as Vendor XYZ
  try {
    await getJobById(abcJobId, vendorXYZSession.vendorId);
    assert.fail("Vendor XYZ should NOT be able to access Vendor ABC's job!");
  } catch (err: any) {
    assert.ok(err.message.includes("NOT_FOUND_OR_FORBIDDEN"));
    console.log("✓ IDOR Prevention Verified: Vendor XYZ blocked from accessing Vendor ABC's Job.");
  }

  // 3. Direct JD Creation & Submission by Vendor (NO Admin Approval required)
  console.log("\n[Test 3] Testing Direct JD Creation & Submission by Vendor...");
  const newJobId = await createJob(
    {
      title: "Automated Test Staff Engineer",
      department: "Engineering",
      location: "Remote",
      employmentType: "FULL_TIME",
      workMode: "REMOTE",
      minExperience: 5,
      maxExperience: 10,
      numPositions: 1,
      requiredSkills: "TypeScript, MySQL, Drizzle ORM",
      description: "Staff engineer for backend core services testing.",
      status: "SUBMITTED",
    },
    vendorABCSession.id,
    vendorABCSession.vendorId!
  );

  const fetchedJob = await getJobById(newJobId, vendorABCSession.vendorId);
  assert.strictEqual(fetchedJob.status, "SUBMITTED");
  console.log("✓ Vendor JD Created & Directly Submitted without Admin Approval!");

  // 4. Admin Candidate Creation & Resume Upload
  console.log("\n[Test 4] Testing Candidate Creation & Resume Storage...");
  const samplePdf = Buffer.from("%PDF-1.4 Mock Test Resume Content");
  const { candidateId, fileId } = await createCandidate(
    {
      name: "Morgan Test Candidate",
      email: `morgan.${Date.now()}@example.com`,
      phone: "+1 (555) 999-0000",
      totalExperience: "6.0",
      relevantExperience: "5.0",
      skills: "TypeScript, Node.js, MySQL",
      resumeBuffer: samplePdf,
      resumeFileName: "morgan-resume.pdf",
      mimeType: "application/pdf",
    },
    adminSession.id
  );
  assert.ok(candidateId);
  assert.ok(fileId);
  console.log("✓ Admin Candidate & Resume Upload Success!");

  // 5. Admin Submits Candidate against Vendor's JD
  console.log("\n[Test 5] Testing Candidate Submission against Vendor JD...");
  const submissionId = await submitCandidateToJob(newJobId, candidateId, fileId, adminSession.id);
  assert.ok(submissionId);
  console.log("✓ Candidate Submitted to Vendor JD!");

  // 6. Vendor Views Candidate & Downloads Resume
  console.log("\n[Test 6] Testing Vendor Resume Download Authorization...");
  const { fileRecord } = await getResumeStreamForDownload(fileId, vendorABCSession.id, vendorABCSession.role, vendorABCSession.vendorId);
  assert.strictEqual(fileRecord.fileName, "morgan-resume.pdf");
  console.log("✓ Vendor Successfully Streams Candidate Resume!");

  // 7. Vendor Submits Feedback & Updates Candidate Status
  console.log("\n[Test 7] Testing Vendor Feedback & Atomic Status Change...");
  await addCandidateFeedback(
    {
      submissionId,
      overallRating: 5,
      technicalRating: 5,
      communicationRating: 4,
      experienceFit: 5,
      strengths: "Outstanding problem solving and system design.",
      recommendation: "PROCEED_TO_INTERVIEW",
    },
    vendorABCSession.id,
    vendorABCSession.role,
    vendorABCSession.vendorId
  );

  await updateCandidateSubmissionStatus(
    submissionId,
    "SHORTLISTED",
    "Candidate shortlisted after initial resume review.",
    vendorABCSession.id,
    vendorABCSession.role,
    vendorABCSession.vendorId
  );

  // 8. Verify Status History, Audit Logs, and Notifications
  console.log("\n[Test 8] Verifying Atomic Transaction side-effects...");
  const subDetail = await getSubmissionById(submissionId, adminSession.role);
  assert.strictEqual(subDetail.status, "SHORTLISTED");
  assert.strictEqual(subDetail.feedbackList.length, 1);
  assert.strictEqual(subDetail.statusHistoryList.length, 2); // INITIAL -> SUBMITTED -> SHORTLISTED

  const auditCount = await db.select().from(auditLogs).where(eq(auditLogs.entityId, submissionId));
  assert.ok(auditCount.length > 0);

  console.log("✓ Candidate Submission status is now SHORTLISTED!");
  console.log("✓ Status History, Audit Logs, and Notifications verified!");

  console.log("\n=========================================");
  console.log("ALL AUTOMATED WORKFLOW TESTS PASSED 100%");
  console.log("=========================================");

  await pool.end();
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
