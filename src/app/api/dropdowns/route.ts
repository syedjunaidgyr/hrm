import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { disciplines, projects, jobTitles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStatuses } from "@/services/status.service";
import { getClientProjectScope } from "@/lib/auth/project-scope";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized." } }, { status: 401 });
    }

    const clientIdParam = request.nextUrl.searchParams.get("clientId");
    const statusClientId =
      session.role === "VENDOR" ? session.vendorId : clientIdParam || null;

    let projectList;
    if (session.vendorId) {
      const scope = await getClientProjectScope(session);
      const allProjects = await db.query.projects.findMany({
        where: eq(projects.clientId, session.vendorId),
        orderBy: (t, { asc }) => [asc(t.name)],
        columns: { id: true, name: true },
      });
      projectList = scope.all
        ? allProjects
        : allProjects.filter((p) => scope.projectIds.includes(p.id));
    } else {
      projectList = await db.query.projects.findMany({
        orderBy: (t, { asc }) => [asc(t.name)],
        columns: { id: true, name: true, clientId: true },
      });
    }

    const [disciplineList, jobTitleList, jdStatuses, candidateStatuses] = await Promise.all([
      db.query.disciplines.findMany({
        where: eq(disciplines.status, "ACTIVE"),
        orderBy: (t, { asc }) => [asc(t.name)],
        columns: { id: true, name: true },
      }),
      db.query.jobTitles.findMany({
        where: eq(jobTitles.status, "ACTIVE"),
        orderBy: (t, { asc }) => [asc(t.name)],
        columns: { id: true, name: true },
      }),
      getStatuses("JD", { clientId: statusClientId }),
      getStatuses("CANDIDATE", { clientId: statusClientId }),
    ]);

    return NextResponse.json({
      success: true,
      disciplines: disciplineList,
      projects: projectList,
      jobTitles: jobTitleList,
      jdStatuses: jdStatuses.map((s) => ({
        code: s.code,
        description: s.description,
        result: s.result,
      })),
      candidateStatuses: candidateStatuses.map((s) => ({
        code: s.code,
        description: s.description,
        result: s.result,
        allowedNext: s.allowedNext
          ? (() => {
              try {
                return JSON.parse(s.allowedNext);
              } catch {
                return [];
              }
            })()
          : [],
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
