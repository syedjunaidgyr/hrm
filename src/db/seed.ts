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
  feedback,
  statusHistory,
  notifications,
  auditLogs,
} from "./schema";
import { LocalStorageProvider } from "../services/storage.service";

async function seed() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash("Admin123!@#", 10);
  const vendorPasswordHash = await bcrypt.hash("Vendor123!@#", 10);

  // 1. Create Vendors
  const vendorABCId = "v1111111-1111-1111-1111-111111111111";
  const vendorXYZId = "v2222222-2222-2222-2222-222222222222";
  const vendorGBLId = "v3333333-3333-3333-3333-333333333333";

  await db.insert(vendors).values([
    {
      id: vendorABCId,
      name: "ABC Technologies",
      code: "VEND-ABC",
      contactEmail: "contact@abctech.com",
      contactPhone: "+1 (555) 019-2831",
      status: "ACTIVE",
      notes: "Tier-1 IT staffing and engineering solutions provider.",
    },
    {
      id: vendorXYZId,
      name: "XYZ Consulting",
      code: "VEND-XYZ",
      contactEmail: "recruitment@xyzconsulting.com",
      contactPhone: "+1 (555) 018-9942",
      status: "ACTIVE",
      notes: "Specializes in enterprise software development talent.",
    },
    {
      id: vendorGBLId,
      name: "Global Solutions",
      code: "VEND-GBL",
      contactEmail: "hr@globalsolutions.com",
      contactPhone: "+1 (555) 014-7733",
      status: "ACTIVE",
      notes: "Global talent partner for data, cloud, and AI roles.",
    },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 2. Create Users
  const adminUserId = "u0000000-0000-0000-0000-000000000000";
  const vendorABCUserId = "u1111111-1111-1111-1111-111111111111";
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
    },
    {
      id: vendorABCUserId,
      vendorId: vendorABCId,
      name: "ABC Recruitment Manager",
      email: "vendor_abc@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
    },
    {
      id: vendorXYZUserId,
      vendorId: vendorXYZId,
      name: "XYZ Talent Lead",
      email: "vendor_xyz@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
    },
    {
      id: vendorGBLUserId,
      vendorId: vendorGBLId,
      name: "Global Solutions Lead",
      email: "vendor_gbl@example.com",
      passwordHash: vendorPasswordHash,
      role: "VENDOR",
      status: "ACTIVE",
    },
  ]).onDuplicateKeyUpdate({ set: { status: "ACTIVE" } });

  // 3. Create Job Descriptions
  const job1Id = "j1111111-1111-1111-1111-111111111111";
  const job2Id = "j2222222-2222-2222-2222-222222222222";
  const job3Id = "j3333333-3333-3333-3333-333333333333";

  await db.insert(jobDescriptions).values([
    {
      id: job1Id,
      vendorId: vendorABCId,
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
      status: "SUBMITTED",
      createdBy: vendorABCUserId,
    },
    {
      id: job2Id,
      vendorId: vendorABCId,
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
      status: "DRAFT",
      createdBy: vendorABCUserId,
    },
    {
      id: job3Id,
      vendorId: vendorXYZId,
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
      status: "SUBMITTED",
      createdBy: vendorXYZUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { status: "SUBMITTED" } });

  // 4. Create Candidates & Resumes
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

  // Upload seed resume files to local storage
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

  // 5. Create Candidate Submissions
  const submission1Id = "s1111111-1111-1111-1111-111111111111";
  const submission2Id = "s2222222-2222-2222-2222-222222222222";

  await db.insert(candidateSubmissions).values([
    {
      id: submission1Id,
      jobId: job1Id,
      candidateId: candidate1Id,
      vendorId: vendorABCId,
      resumeFileId: file1Id,
      status: "SUBMITTED",
      submittedBy: adminUserId,
    },
    {
      id: submission2Id,
      jobId: job3Id,
      candidateId: candidate2Id,
      vendorId: vendorXYZId,
      resumeFileId: file2Id,
      status: "SUBMITTED",
      submittedBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { status: "SUBMITTED" } });

  // 6. Status History
  await db.insert(statusHistory).values([
    {
      id: "sh111111-1111-1111-1111-111111111111",
      submissionId: submission1Id,
      fromStatus: "INITIAL",
      toStatus: "SUBMITTED",
      reason: "Candidate profile submitted by Admin.",
      changedBy: adminUserId,
    },
    {
      id: "sh222222-2222-2222-2222-222222222222",
      submissionId: submission2Id,
      fromStatus: "INITIAL",
      toStatus: "SUBMITTED",
      reason: "Candidate profile submitted by Admin.",
      changedBy: adminUserId,
    },
  ]).onDuplicateKeyUpdate({ set: { fromStatus: "INITIAL" } });

  // 7. Audit Logs
  await db.insert(auditLogs).values([
    {
      id: "a1111111-1111-1111-1111-111111111111",
      userId: adminUserId,
      action: "SUBMIT_CANDIDATE",
      entityType: "CandidateSubmission",
      entityId: submission1Id,
      newValue: JSON.stringify({ jobId: job1Id, candidateId: candidate1Id, status: "SUBMITTED" }),
      ipAddress: "127.0.0.1",
      userAgent: "Seed Script",
    },
  ]).onDuplicateKeyUpdate({ set: { action: "SUBMIT_CANDIDATE" } });

  // 8. Notifications
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
  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
