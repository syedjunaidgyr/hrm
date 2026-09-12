import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import {
  vendors,
  users,
  jobDescriptions,
  candidates,
  files,
  candidateSubmissions,
  statusHistory,
  notifications,
  auditLogs,
  projects,
  disciplines,
  statusMasters,
  jobTitles,
  userProjects,
} from "./schema";
import { LocalStorageProvider } from "../services/storage.service";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash("Admin123!@#", 10);
  const vendorPasswordHash = await bcrypt.hash("Vendor123!@#", 10);

  // 1. Create Clients (vendors table)
  const vendorABCId = "v1111111-1111-1111-1111-111111111111";
  const vendorXYZId = "v2222222-2222-2222-2222-222222222222";
  const vendorGBLId = "v3333333-3333-3333-3333-333333333333";

  await db.insert(vendors).values([
    {
      id: vendorABCId,
      name: "ABC Technologies",
      code: "VEND-ABC",
      contactName: "ABC Contact",
      contactEmail: "contact@abctech.com",
      contactPhone: "+1 (555) 019-2831",
      status: "ACTIVE",
      notes: "Tier-1 IT staffing and engineering solutions provider.",
    },
    {
      id: vendorXYZId,
      name: "XYZ Consulting",
      code: "VEND-XYZ",
      contactName: "XYZ Contact",
      contactEmail: "recruitment@xyzconsulting.com",
      contactPhone: "+1 (555) 018-9942",
      status: "ACTIVE",
      notes: "Specializes in enterprise software development talent.",
    },
    {
      id: vendorGBLId,
      name: "Global Solutions",
      code: "VEND-GBL",
      contactName: "GBL Contact",
      contactEmail: "hr@globalsolutions.com",
      contactPhone: "+1 (555) 014-7733",
      status: "ACTIVE",
      notes: "Global talent partner for data, cloud, and AI roles.",
    },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 2. Disciplines
  const discEngId = "d1111111-1111-1111-1111-111111111111";
  const discInfraId = "d2222222-2222-2222-2222-222222222222";
  const discAnalyticsId = "d3333333-3333-3333-3333-333333333333";

  await db.insert(disciplines).values([
    { id: discEngId, name: "Engineering", status: "ACTIVE" },
    { id: discInfraId, name: "Infrastructure", status: "ACTIVE" },
    { id: discAnalyticsId, name: "Analytics", status: "ACTIVE" },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 3. Job Titles master
  const jt1 = "jt111111-1111-1111-1111-111111111111";
  const jt2 = "jt222222-2222-2222-2222-222222222222";
  const jt3 = "jt333333-3333-3333-3333-333333333333";

  await db.insert(jobTitles).values([
    { id: jt1, name: "Senior Full Stack Engineer (React/Node)", status: "ACTIVE" },
    { id: jt2, name: "DevOps Engineer (Kubernetes & Cloud)", status: "ACTIVE" },
    { id: jt3, name: "Data Analyst & Business Intelligence Specialist", status: "ACTIVE" },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 4. Projects
  const projABC1 = "p1111111-1111-1111-1111-111111111111";
  const projABC2 = "p2222222-2222-2222-2222-222222222222";
  const projXYZ1 = "p3333333-3333-3333-3333-333333333333";

  await db.insert(projects).values([
    {
      id: projABC1,
      clientId: vendorABCId,
      name: "ABC Platform Rebuild",
      contactName: "Jane Doe",
      contactEmail: "jane@abctech.com",
      status: "ACTIVE",
    },
    {
      id: projABC2,
      clientId: vendorABCId,
      name: "ABC Cloud Migration",
      contactName: "John Smith",
      contactEmail: "john@abctech.com",
      status: "ACTIVE",
    },
    {
      id: projXYZ1,
      clientId: vendorXYZId,
      name: "XYZ Analytics Hub",
      contactName: "Sara Lee",
      contactEmail: "sara@xyzconsulting.com",
      status: "ACTIVE",
    },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 5. Status Masters — JD
  const jdStatuses = [
    { id: "sm-jd-01", code: "PENDING", description: "Pending", result: "PENDING", sortOrder: 1, allowedNext: null },
    { id: "sm-jd-02", code: "WIP", description: "WIP", result: "WIP", sortOrder: 2, allowedNext: null },
    { id: "sm-jd-03", code: "ON_HOLD", description: "On Hold", result: "WIP", sortOrder: 3, allowedNext: null },
    { id: "sm-jd-04", code: "CANCELLED", description: "Cancelled", result: "CLOSED", sortOrder: 4, allowedNext: null },
    { id: "sm-jd-05", code: "COMPLETED", description: "Completed", result: "CLOSED", sortOrder: 5, allowedNext: null },
  ];

  // Candidate statuses with transitions
  const candStatuses = [
    {
      id: "sm-c-01",
      code: "NEW",
      description: "New",
      result: "PENDING",
      sortOrder: 1,
      allowedNext: ["VIEWED", "REJECTED_L1", "INTERVIEW_SCHEDULED", "ON_HOLD"],
    },
    {
      id: "sm-c-02",
      code: "VIEWED",
      description: "Viewed",
      result: "PENDING",
      sortOrder: 2,
      allowedNext: ["REJECTED_L1", "INTERVIEW_SCHEDULED", "ON_HOLD"],
    },
    {
      id: "sm-c-03",
      code: "REJECTED_L1",
      description: "Rejected Level 1",
      result: "CLOSED",
      sortOrder: 3,
      allowedNext: ["INTERVIEW_SCHEDULED"],
    },
    {
      id: "sm-c-04",
      code: "INTERVIEW_SCHEDULED",
      description: "Interview Scheduled",
      result: "WIP",
      sortOrder: 4,
      allowedNext: ["INTERVIEW_COMPLETED", "REJECTED_L1", "ON_HOLD"],
    },
    {
      id: "sm-c-05",
      code: "INTERVIEW_COMPLETED",
      description: "Interview Completed",
      result: "WIP",
      sortOrder: 5,
      allowedNext: ["REJECTED_L2", "PROGRESSED", "ON_HOLD"],
    },
    {
      id: "sm-c-06",
      code: "REJECTED_L2",
      description: "Rejected Level 2",
      result: "CLOSED",
      sortOrder: 6,
      allowedNext: [],
    },
    {
      id: "sm-c-07",
      code: "PROGRESSED",
      description: "Progressed",
      result: "WIP",
      sortOrder: 7,
      allowedNext: ["ONBOARDED", "REJECTED_L2", "ON_HOLD"],
    },
    {
      id: "sm-c-08",
      code: "ONBOARDED",
      description: "On Boarded",
      result: "CLOSED",
      sortOrder: 8,
      allowedNext: ["BILLED"],
    },
    {
      id: "sm-c-09",
      code: "BILLED",
      description: "Billed",
      result: "CLOSED",
      sortOrder: 9,
      allowedNext: [],
    },
    {
      id: "sm-c-10",
      code: "ON_HOLD",
      description: "On Hold",
      result: "WIP",
      sortOrder: 10,
      allowedNext: ["VIEWED", "INTERVIEW_SCHEDULED", "REJECTED_L1", "PROGRESSED"],
    },
  ];

  await db.insert(statusMasters).values([
    ...jdStatuses.map((s) => ({
      id: s.id,
      entityType: "JD" as const,
      code: s.code,
      description: s.description,
      result: s.result,
      clientId: null,
      sortOrder: s.sortOrder,
      isActive: true,
      isSystem: true,
      allowedNext: null as string | null,
    })),
    ...candStatuses.map((s) => ({
      id: s.id,
      entityType: "CANDIDATE" as const,
      code: s.code,
      description: s.description,
      result: s.result,
      clientId: null,
      sortOrder: s.sortOrder,
      isActive: true,
      isSystem: true,
      allowedNext: JSON.stringify(s.allowedNext),
    })),
  ]).onDuplicateKeyUpdate({ set: { isActive: true } });

  // 6. Users
  const adminUserId = "u0000000-0000-0000-0000-000000000000";
  const vendorABCUserId = "u1111111-1111-1111-1111-111111111111";
  const vendorABCUser2Id = "u1111111-1111-1111-1111-111111111112";
  const vendorXYZUserId = "u2222222-2222-2222-2222-222222222222";
  const vendorGBLUserId = "u3333333-3333-3333-3333-333333333333";

  await db.insert(users).values([
    {
      id: adminUserId,
      vendorId: null,
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      accessAllProjects: false,
    },
    {
      id: vendorABCUserId,
      vendorId: vendorABCId,
      name: "ABC Recruitment Manager",
      email: "vendor_abc@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
      accessAllProjects: true, // sees all ABC projects
    },
    {
      id: vendorABCUser2Id,
      vendorId: vendorABCId,
      name: "ABC Project Lead (Platform)",
      email: "vendor_abc_proj@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
      accessAllProjects: false, // only Platform Rebuild
    },
    {
      id: vendorXYZUserId,
      vendorId: vendorXYZId,
      name: "XYZ Talent Lead",
      email: "vendor_xyz@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
      accessAllProjects: true,
    },
    {
      id: vendorGBLUserId,
      vendorId: vendorGBLId,
      name: "Global Solutions Lead",
      email: "vendor_gbl@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
      accessAllProjects: true,
    },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 7. User ↔ Project tags
  await db.insert(userProjects).values([
    {
      id: "up111111-1111-1111-1111-111111111111",
      userId: vendorABCUser2Id,
      projectId: projABC1,
    },
  ]).onDuplicateKeyUpdate({ set: { projectId: projABC1 } });

  // 8. Job Descriptions
  const job1Id = "j1111111-1111-1111-1111-111111111111";
  const job2Id = "j2222222-2222-2222-2222-222222222222";
  const job3Id = "j3333333-3333-3333-3333-333333333333";

  await db.insert(jobDescriptions).values([
    {
      id: job1Id,
      vendorId: vendorABCId,
      projectId: projABC1,
      disciplineId: discEngId,
      jobCode: "JOB-ABC-01",
      title: "Senior Full Stack Engineer (React/Node)",
      department: "Engineering",
      location: "San Francisco, CA",
      employmentType: "FULL_TIME",
      workMode: "HYBRID",
      minExperience: 5,
      maxExperience: 8,
      numPositions: 3,
      minSalary: "130000.00",
      maxSalary: "165000.00",
      requiredSkills: "React, Node.js, TypeScript, Next.js, MySQL",
      preferredSkills: "GraphQL, AWS, Docker knowledge, Tailwind CSS",
      description: "We are seeking an experienced Senior Full Stack Engineer to lead web product development.",
      responsibilities: "Build scalable microservices, create responsive UI dashboards, optimize SQL query execution.",
      requirements: "5+ years software engineering experience with modern JavaScript frameworks.",
      education: "Bachelor in Computer Science or equivalent experience",
      noticePeriod: "30 Days",
      priority: "HIGH",
      status: "PENDING",
      createdBy: vendorABCUserId,
    },
    {
      id: job2Id,
      vendorId: vendorABCId,
      projectId: projABC2,
      disciplineId: discInfraId,
      jobCode: "JOB-ABC-02",
      title: "DevOps Engineer (Kubernetes & Cloud)",
      department: "Infrastructure",
      location: "Remote",
      employmentType: "CONTRACT",
      workMode: "REMOTE",
      minExperience: 3,
      maxExperience: 6,
      numPositions: 2,
      minSalary: "100000.00",
      maxSalary: "135000.00",
      requiredSkills: "Terraform, Kubernetes, CI/CD, AWS",
      preferredSkills: "Prometheus, Grafana, Ansible",
      description: "Looking for a DevOps engineer to maintain continuous delivery pipelines.",
      responsibilities: "Automate cloud infrastructure provisioning and improve deployment reliability.",
      requirements: "3+ years hands-on experience in AWS cloud infrastructure.",
      education: "BS Computer Engineering",
      noticePeriod: "15 Days",
      priority: "MEDIUM",
      status: "WIP",
      createdBy: vendorABCUserId,
    },
    {
      id: job3Id,
      vendorId: vendorXYZId,
      projectId: projXYZ1,
      disciplineId: discAnalyticsId,
      jobCode: "JOB-XYZ-01",
      title: "Data Analyst & Business Intelligence Specialist",
      department: "Analytics",
      location: "New York, NY",
      employmentType: "FULL_TIME",
      workMode: "ON_SITE",
      minExperience: 2,
      maxExperience: 5,
      numPositions: 1,
      minSalary: "90000.00",
      maxSalary: "115000.00",
      requiredSkills: "SQL, Python, Tableau, Power BI",
      preferredSkills: "Snowflake, dbt, R",
      description: "Join our data team to produce actionable business insights for executive leadership.",
      responsibilities: "Design SQL data pipelines and build interactive Tableau dashboards.",
      requirements: "Proven track record in data modeling and SQL analytics.",
      education: "Degree in Statistics, Finance, or Analytics",
      noticePeriod: "Immediate",
      priority: "HIGH",
      status: "PENDING",
      createdBy: vendorXYZUserId,
    },
  ]).onDuplicateKeyUpdate({
    set: {
      status: "PENDING",
      projectId: projABC1,
      disciplineId: discEngId,
    },
  });

  // Force job2/job3 project links on re-seed (MySQL ON DUPLICATE only updates one row's SET;
  // apply explicit updates so existing DBs get correct project scoping.)
  await db.update(jobDescriptions).set({ projectId: projABC1, disciplineId: discEngId }).where(eq(jobDescriptions.id, job1Id));
  await db.update(jobDescriptions).set({ projectId: projABC2, disciplineId: discInfraId, status: "WIP" }).where(eq(jobDescriptions.id, job2Id));
  await db.update(jobDescriptions).set({ projectId: projXYZ1, disciplineId: discAnalyticsId }).where(eq(jobDescriptions.id, job3Id));

  // 9. Candidates & Resumes
  const candidate1Id = "c1111111-1111-1111-1111-111111111111";
  const candidate2Id = "c2222222-2222-2222-2222-222222222222";

  await db.insert(candidates).values([
    {
      id: candidate1Id,
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 234-5678",
      totalExperience: "6.5",
      relevantExperience: "5.0",
      currentCompany: "TechScale Systems",
      currentDesignation: "Senior Software Developer",
      currentLocation: "San Jose, CA",
      preferredLocation: "San Francisco, CA / Remote",
      skills: "React, Node.js, TypeScript, PostgreSQL, REST APIs",
      noticePeriod: "30 Days",
      currentSalary: "125000.00",
      expectedSalary: "150000.00",
      source: "LinkedIn Direct",
      recruiter: "Admin Recruiter Lead",
      notes: "Strong technical background in React and microservices architecture.",
      createdBy: adminUserId,
    },
    {
      id: candidate2Id,
      name: "Sophia Chen",
      email: "sophia.chen@example.com",
      phone: "+1 (555) 876-5432",
      totalExperience: "4.0",
      relevantExperience: "4.0",
      currentCompany: "DataMetrics Inc",
      currentDesignation: "BI & Data Analyst",
      currentLocation: "New York, NY",
      preferredLocation: "New York, NY",
      skills: "SQL, Python, Power BI, Excel, ETL Pipelines",
      noticePeriod: "15 Days",
      currentSalary: "88000.00",
      expectedSalary: "105000.00",
      source: "Referral",
      recruiter: "Admin Recruiter Lead",
      notes: "Excellent analytical skill set with strong SQL competency.",
      createdBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { name: "Alex Rivera" } });

  const storage = new LocalStorageProvider();
  const samplePdfContent = Buffer.from("%PDF-1.4 Mock Candidate Resume Document for Recruitment Portal Test");

  const file1Id = "f1111111-1111-1111-1111-111111111111";
  const file2Id = "f2222222-2222-2222-2222-222222222222";

  const key1 = `resumes/${candidate1Id}/resume-alex-rivera.pdf`;
  const key2 = `resumes/${candidate2Id}/resume-sophia-chen.pdf`;

  await storage.upload(samplePdfContent, key1);
  await storage.upload(samplePdfContent, key2);

  await db.insert(files).values([
    {
      id: file1Id,
      candidateId: candidate1Id,
      fileName: "resume-alex-rivera.pdf",
      storageKey: key1,
      storageProvider: "local",
      mimeType: "application/pdf",
      fileSize: samplePdfContent.length,
      uploadedBy: adminUserId,
    },
    {
      id: file2Id,
      candidateId: candidate2Id,
      fileName: "resume-sophia-chen.pdf",
      storageKey: key2,
      storageProvider: "local",
      mimeType: "application/pdf",
      fileSize: samplePdfContent.length,
      uploadedBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { mimeType: "application/pdf" } });

  // 10. Submissions
  const submission1Id = "s1111111-1111-1111-1111-111111111111";
  const submission2Id = "s2222222-2222-2222-2222-222222222222";

  await db.insert(candidateSubmissions).values([
    {
      id: submission1Id,
      jobId: job1Id,
      candidateId: candidate1Id,
      vendorId: vendorABCId,
      resumeFileId: file1Id,
      status: "NEW",
      submittedBy: adminUserId,
    },
    {
      id: submission2Id,
      jobId: job3Id,
      candidateId: candidate2Id,
      vendorId: vendorXYZId,
      resumeFileId: file2Id,
      status: "NEW",
      submittedBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { status: "NEW" } });

  await db.insert(statusHistory).values([
    {
      id: "sh111111-1111-1111-1111-111111111111",
      submissionId: submission1Id,
      fromStatus: "INITIAL",
      toStatus: "NEW",
      reason: "Candidate profile submitted by Admin.",
      changedBy: adminUserId,
    },
    {
      id: "sh222222-2222-2222-2222-222222222222",
      submissionId: submission2Id,
      fromStatus: "INITIAL",
      toStatus: "NEW",
      reason: "Candidate profile submitted by Admin.",
      changedBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { fromStatus: "INITIAL" } });

  await db.insert(auditLogs).values([
    {
      id: "a1111111-1111-1111-1111-111111111111",
      userId: adminUserId,
      action: "SUBMIT_CANDIDATE",
      entityType: "CandidateSubmission",
      entityId: submission1Id,
      newValue: JSON.stringify({ jobId: job1Id, candidateId: candidate1Id, status: "NEW" }),
      ipAddress: "127.0.0.1",
      userAgent: "Seed Script",
    },
  ]).onDuplicateKeyUpdate({ set: { action: "SUBMIT_CANDIDATE" } });

  await db.insert(notifications).values([
    {
      id: "n1111111-1111-1111-1111-111111111111",
      userId: vendorABCUserId,
      title: "New Candidate Submission",
      message: "Alex Rivera has been submitted for 'Senior Full Stack Engineer'.",
      link: `/vendor/candidates/${submission1Id}`,
      isRead: false,
      type: "INFO",
    },
  ]).onDuplicateKeyUpdate({ set: { isRead: false } });

  console.log("Database seeded successfully!");
  console.log("  Admin: admin@example.com / Admin123!@#");
  console.log("  Client (all projects): vendor_abc@example.com / Vendor123!@#");
  console.log("  Client (project-scoped): vendor_abc_proj@example.com / Vendor123!@#");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
