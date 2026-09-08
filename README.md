# Enterprise Vendor Recruitment Management Portal

A full-stack, production-ready enterprise **Vendor Recruitment Management Portal** built using **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **MySQL 8+**, **Drizzle ORM**, and secure session authentication.

This platform bridges internal **ADMIN** teams with external recruitment **VENDORS** to streamline job description submissions, candidate sourcing, resume management, structured feedback, and real-time candidate recruitment pipeline tracking.

---

## Key Features

- **Multi-Tenant Role-Based Access Control (RBAC)**:
  - `ADMIN`: Global dashboard, vendor partner management, job oversight, candidate creation & resume uploads, candidate submissions against active vendor JDs, global reporting, audit logs.
  - `VENDOR`: Vendor dashboard, job description creation & direct submission, submitted candidates tracking, candidate resume view & secure streaming download, structured candidate feedback (1-5 ratings & recommendations), candidate recruitment status updates.
- **Direct Vendor Job Description (JD) Workflow**:
  - Vendors can create, draft, edit, and directly submit Job Descriptions.
  - **No Admin approval or rejection gate exists for JDs.**
- **Candidate Submission Data Isolation**:
  - Recruitment status belongs to `CandidateSubmission`, NOT `Candidate`.
  - A candidate can be safely submitted to multiple jobs across vendors while enforcing strict database-level vendor data boundaries.
- **Resume Storage Abstraction**:
  - Binary resume files are stored on disk (`./storage`) in development using `LocalStorageProvider` or AWS S3/Cloudflare R2 in production via `S3StorageProvider`.
  - MySQL stores resume metadata only. Resumes are served through authenticated streaming endpoints with IDOR protection.
- **Atomic Transactions & Audit Logging**:
  - Status changes execute atomically within a single Drizzle transaction, inserting records into `status_history`, `audit_logs`, and `notifications`.
- **Zero Third-Party UI Component Libraries**:
  - Built using 100% custom React + Tailwind CSS components. No shadcn/ui, no Radix UI, no heavy component abstractions.
- **Zero Docker**:
  - Runs directly on host OS using standard Node.js, npm, and local MySQL server.

---

## User Roles & Credentials (Seed Data)

### Admin User
- **Email**: `admin@example.com`
- **Password**: `Admin123!@#`

### Vendor Accounts
1. **ABC Technologies** (`VEND-ABC`):
   - **Email**: `vendor_abc@example.com`
   - **Password**: `Vendor123!@#`
2. **XYZ Consulting** (`VEND-XYZ`):
   - **Email**: `vendor_xyz@example.com`
   - **Password**: `Vendor123!@#`
3. **Global Solutions** (`VEND-GBL`):
   - **Email**: `vendor_gbl@example.com`
   - **Password**: `Vendor123!@#`

---

## System Architecture

```text
Browser UI (React 19 + Custom Tailwind CSS Design System)
                     │
                     ▼
Next.js App Router (Pages, Server Actions, Route Handlers)
                     │
                     ▼
Service Layer (Auth, Job, Candidate, Submission, Feedback, Notification, Audit, Storage)
                     │
                     ▼
Drizzle ORM & Database Connection Pool (mysql2)
                     │
                     ▼
MySQL 8+ Database Server
```

---

## Core Business Workflow

```text
VENDOR
   │
   ├── 1. Create Job Description
   ├── 2. Save as Draft OR Submit Job Description
   └── 3. Job becomes immediately available for recruitment (NO Admin JD Approval)
            │
            ▼
          ADMIN
            │
            ├── 4. Create Candidate
            ├── 5. Upload Resume (PDF, DOC, DOCX)
            └── 6. Submit Candidate against Vendor's active Job Description
                     │
                     ▼
                   VENDOR
                     │
                     ├── 7. View Candidate Submission
                     ├── 8. Stream/Download Candidate Resume securely
                     ├── 9. Submit Structured Feedback (Ratings 1-5 & Recommendations)
                     └── 10. Update Candidate Recruitment Status (e.g. SHORTLISTED)
                              │
                              ▼
                            ADMIN
                              │
                              ├── 11. Instantly sees updated status & feedback
                              ├── 12. Views status history timeline
                              └── 13. Verifies system audit log & in-app notifications
```

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide React
- **Form & Validation**: React Hook Form + Zod
- **Database**: MySQL 8+
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `mysql2`)
- **Authentication**: JWT Sessions (`jose` & `bcryptjs` password hashing)
- **Storage**: Storage Abstraction (`LocalStorageProvider` & `S3StorageProvider`)

---

## Local Setup & Installation (Without Docker)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **npm**: v9.0.0 or higher
- **MySQL Server**: 8.0 or higher running locally on port 3306

### 2. Configure Environment Variables
Create `.env` file in the root directory:

```env
DATABASE_URL=mysql://root:Password123!%40%23@127.0.0.1:3306/recruitment_portal
AUTH_SECRET=super-secret-key-recruitment-portal-2026-auth-jwt
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./storage
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

*Note: If your MySQL password contains special characters like `@` or `#`, use URL encoding (`@` -> `%40`, `#` -> `%23`).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup MySQL Database & Run Migrations
```bash
# Generate SQL migrations via Drizzle Kit
npm run db:generate

# Apply migrations to local MySQL database
npm run db:migrate

# Seed database with initial Admin, Vendors, Jobs, Candidates, and Resumes
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Workflow Tests

Run the full automated test suite validating authentication, RBAC, Vendor data isolation, direct JD submission, candidate resume uploads, resume streaming authorization, structured feedback, and atomic status transitions:

```bash
npm run test:workflow
```

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/login/             # Login page with demo account shortcuts
│   ├── admin/                    # Admin portal pages
│   │   ├── dashboard/            # Admin analytics & performance dashboard
│   │   ├── vendors/              # Vendor partner management
│   │   ├── jobs/                 # Global job descriptions table
│   │   ├── candidates/           # Candidate pool & submission modal
│   │   ├── submissions/          # Candidate submissions & detail timeline
│   │   ├── reports/              # Recruitment pipeline reports
│   │   └── audit-logs/           # System audit logs
│   ├── vendor/                   # Vendor portal pages
│   │   ├── dashboard/            # Vendor dashboard & candidate pipeline
│   │   ├── jobs/                 # Vendor JDs & creation form
│   │   └── candidates/           # Candidate review, feedback & status update
│   └── api/                      # Next.js Route Handlers (Auth, Resumes, Submissions, Notifications)
├── components/
│   ├── layout/                   # Navbar, AdminSidebar, VendorSidebar, DashboardLayout
│   └── ui/                       # Custom Tailwind components (Button, Input, Select, Badge, Modal, Table, Toast, Card, Tabs)
├── db/
│   ├── index.ts                  # Reusable MySQL pool & Drizzle ORM instance
│   ├── schema/                   # Schema definitions (users, vendors, jobs, candidates, submissions, feedback, audit_logs)
│   ├── migrate.ts                # Programmatic migration executor
│   └── seed.ts                   # Realistic seed script
├── services/                     # Service layer business logic
│   ├── auth.service.ts
│   ├── job.service.ts
│   ├── candidate.service.ts
│   ├── submission.service.ts
│   ├── feedback.service.ts
│   ├── notification.service.ts
│   ├── audit.service.ts
│   └── storage.service.ts
├── lib/
│   └── auth/session.ts           # JWT HTTP-only cookie session & RBAC helpers
└── tests/
    └── workflow.ts               # Automated end-to-end integration test suite
```

---

## Production Build

To test production bundle compilation:

```bash
npm run build
npm start
```
