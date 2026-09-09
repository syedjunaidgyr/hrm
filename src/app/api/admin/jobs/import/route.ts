import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { jobDescriptions, vendors, disciplines, projects } from "@/db/schema";
import { eq, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as XLSX from "xlsx";

/**
 * Expected spreadsheet columns (case-insensitive, trimmed):
 *   JD Code | Title | Discipline | Project | Location | Positions |
 *   Min Exp | Max Exp | Required Skills | Description | Priority |
 *   Status | Date Received | Date Closed | Client (name or code)
 *
 * All columns except Title, Location, Required Skills, Description are optional.
 * If JD Code is blank, one is auto-generated.
 * Client column must match an existing vendor name or code (case-insensitive).
 */

/** GET /api/admin/jobs/import — returns a sample .xlsx file for download */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
  }

  const sampleRows = [
    {
      Client: "Acme Corp",
      Title: "Senior Software Engineer",
      Location: "New York, NY",
      "Required Skills": "React, Node.js, TypeScript",
      Description: "We are looking for a senior engineer to join our team.",
      "JD Code": "JOB-ACME-1001",
      Discipline: "Engineering",
      Project: "",
      Positions: 2,
      Priority: "HIGH",
      Status: "PENDING",
      "Date Received": "2026-01-15",
      "Date Closed": "",
      "Min Exp": 5,
      "Max Exp": 10,
      "Preferred Skills": "AWS, Docker",
      Responsibilities: "Lead technical design, mentor junior developers.",
    },
    {
      Client: "Beta Ltd",
      Title: "Product Manager",
      Location: "Remote",
      "Required Skills": "Product strategy, Agile, Roadmap planning",
      Description: "Seeking an experienced PM to own the product roadmap.",
      "JD Code": "",
      Discipline: "Product",
      Project: "",
      Positions: 1,
      Priority: "MEDIUM",
      Status: "PENDING",
      "Date Received": "2026-02-01",
      "Date Closed": "",
      "Min Exp": 3,
      "Max Exp": 8,
      "Preferred Skills": "JIRA, Confluence",
      Responsibilities: "Define product vision and work with cross-functional teams.",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);

  // Set column widths for readability
  worksheet["!cols"] = [
    { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 35 }, { wch: 50 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
    { wch: 25 }, { wch: 50 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Job Descriptions");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="rightfit_jobs_sample.xlsx"',
    },
  });
}

function normaliseHeader(h: string): string {
  return String(h ?? "")
    .toLowerCase()
    .replace(/[\s_\-\/]+/g, "_")
    .trim();
}

function pickCell(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[normaliseHeader(k)];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function toDateStr(raw: string): string | null {
  if (!raw) return null;
  // Handles "2026-01-15", "15/01/2026", "Jan 15 2026", or Excel serial numbers
  const serial = Number(raw);
  if (!isNaN(serial) && serial > 1000) {
    // Excel date serial
    const d = XLSX.SSF.parse_date_code(serial);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.y}-${pad(d.m)}-${pad(d.d)}`;
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const previewOnly = formData.get("preview") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: { message: "No file uploaded." } }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: { message: "Spreadsheet appears to be empty." } }, { status: 400 });
    }

    // Normalise all header keys
    const rows: Record<string, string>[] = rawRows.map((r) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        out[normaliseHeader(k)] = String(v ?? "").trim();
      }
      return out;
    });

    // Lookup caches
    const [allVendors, allDisciplines, allProjects] = await Promise.all([
      db.query.vendors.findMany({ columns: { id: true, name: true, code: true } }),
      db.query.disciplines.findMany({ columns: { id: true, name: true } }),
      db.query.projects.findMany({ columns: { id: true, name: true, clientId: true } }),
    ]);

    const vendorByName = new Map(allVendors.map((v) => [v.name.toLowerCase(), v]));
    const vendorByCode = new Map(allVendors.map((v) => [v.code.toLowerCase(), v]));
    const disciplineByName = new Map(allDisciplines.map((d) => [d.name.toLowerCase(), d]));
    const projectByName = new Map(allProjects.map((p) => [p.name.toLowerCase(), p]));

    const parsed: Array<{
      rowNum: number;
      errors: string[];
      data: Record<string, unknown>;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header row
      const errors: string[] = [];

      const title = pickCell(row, "Title", "Job Title", "title");
      const location = pickCell(row, "Location", "location");
      const requiredSkills = pickCell(row, "Required Skills", "required_skills", "skills");
      const description = pickCell(row, "Description", "Job Description", "description");

      if (!title) errors.push("Title is required");
      if (!location) errors.push("Location is required");
      if (!requiredSkills) errors.push("Required Skills is required");
      if (!description) errors.push("Description is required");

      // Client resolution
      const clientRaw = pickCell(row, "Client", "Vendor", "client", "vendor");
      let vendorId: string | null = null;
      if (clientRaw) {
        const v = vendorByName.get(clientRaw.toLowerCase()) ?? vendorByCode.get(clientRaw.toLowerCase());
        if (v) vendorId = v.id;
        else errors.push(`Client not found: "${clientRaw}"`);
      } else {
        errors.push("Client is required");
      }

      // Discipline
      const disciplineRaw = pickCell(row, "Discipline", "Department", "discipline");
      let disciplineId: string | null = null;
      if (disciplineRaw) {
        const d = disciplineByName.get(disciplineRaw.toLowerCase());
        if (d) disciplineId = d.id;
      }

      // Project
      const projectRaw = pickCell(row, "Project", "project");
      let projectId: string | null = null;
      if (projectRaw) {
        const p = projectByName.get(projectRaw.toLowerCase());
        if (p) projectId = p.id;
      }

      // JD Code — auto-generate if blank
      let jobCode = pickCell(row, "JD Code", "Job Code", "jd_code", "job_code");
      if (!jobCode && vendorId) {
        const vendor = allVendors.find((v) => v.id === vendorId);
        jobCode = `JOB-${(vendor?.code ?? "XXX").substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Priority
      const priorityRaw = pickCell(row, "Priority", "priority").toUpperCase();
      const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priorityRaw) ? priorityRaw : "MEDIUM";

      // Status
      const statusRaw = pickCell(row, "Status", "status").toUpperCase();
      const status = ["PENDING", "WIP", "COMPLETED", "CANCELLED"].includes(statusRaw) ? statusRaw : "PENDING";

      // Numbers
      const numPositions = parseInt(pickCell(row, "Positions", "No of Positions", "num_positions") || "1", 10) || 1;
      const minExp = parseInt(pickCell(row, "Min Exp", "Min Experience", "min_exp") || "0", 10) || 0;
      const maxExp = parseInt(pickCell(row, "Max Exp", "Max Experience", "max_exp") || "0", 10) || 0;

      // Dates
      const dateReceived = toDateStr(pickCell(row, "Date Received", "date_received"));
      const dateClosed = toDateStr(pickCell(row, "Date Closed", "date_closed"));

      parsed.push({
        rowNum,
        errors,
        data: {
          jobCode,
          title,
          location,
          requiredSkills,
          description,
          vendorId,
          disciplineId,
          discipline: disciplineRaw || null,
          projectId,
          priority,
          status,
          numPositions,
          minExperience: minExp,
          maxExperience: maxExp,
          dateReceived,
          dateClosed,
          preferredSkills: pickCell(row, "Preferred Skills", "preferred_skills") || null,
          responsibilities: pickCell(row, "Responsibilities", "responsibilities") || null,
          employmentType: "FULL_TIME",
          workMode: "ON_SITE",
          createdBy: session.id,
        },
      });
    }

    // If preview mode, return parsed rows without inserting
    if (previewOnly) {
      return NextResponse.json({ success: true, preview: parsed, total: parsed.length });
    }

    // Filter out rows with errors
    const validRows = parsed.filter((r) => r.errors.length === 0);
    const invalidRows = parsed.filter((r) => r.errors.length > 0);

    if (validRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: { message: "No valid rows to import." },
        invalidRows,
      }, { status: 400 });
    }

    // Bulk insert in a transaction
    const inserted: string[] = [];
    await db.transaction(async (tx) => {
      for (const row of validRows) {
        const d = row.data as any;
        const id = randomUUID();
        await tx.insert(jobDescriptions).values({
          id,
          vendorId: d.vendorId,
          projectId: d.projectId,
          disciplineId: d.disciplineId,
          jobCode: d.jobCode,
          title: d.title,
          department: d.discipline,
          location: d.location,
          employmentType: d.employmentType,
          workMode: d.workMode,
          minExperience: d.minExperience,
          maxExperience: d.maxExperience,
          numPositions: d.numPositions,
          deliveredQty: 0,
          requiredSkills: d.requiredSkills,
          preferredSkills: d.preferredSkills,
          description: d.description,
          responsibilities: d.responsibilities,
          priority: d.priority,
          status: d.status,
          dateReceived: d.dateReceived,
          dateClosed: d.dateClosed,
          createdBy: d.createdBy,
        });
        inserted.push(id);
      }
    });

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      skipped: invalidRows.length,
      invalidRows,
    });
  } catch (err: any) {
    console.error("[import/jobs]", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Import failed." } },
      { status: 500 }
    );
  }
}
