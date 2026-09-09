import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { disciplines, projects } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized." } }, { status: 401 });
    }

    const [disciplineList, projectList] = await Promise.all([
      db.query.disciplines.findMany({
        where: eq(disciplines.status, "ACTIVE"),
        orderBy: (t, { asc }) => [asc(t.name)],
        columns: { id: true, name: true },
      }),
      session.vendorId
        ? db.query.projects.findMany({
            where: eq(projects.clientId, session.vendorId),
            orderBy: (t, { asc }) => [asc(t.name)],
            columns: { id: true, name: true },
          })
        : // Admin: return all projects
          db.query.projects.findMany({
            orderBy: (t, { asc }) => [asc(t.name)],
            columns: { id: true, name: true, clientId: true },
          }),
    ]);

    return NextResponse.json({ success: true, disciplines: disciplineList, projects: projectList });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
