import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createCandidate } from "@/services/candidate.service";
import { submitCandidateToJob } from "@/services/submission.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Unauthorized admin access." } }, { status: 403 });
    }

    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;
    if (!resumeFile) {
      return NextResponse.json({ success: false, error: { message: "Resume file is required." } }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const selectedJobId = formData.get("selectedJobId") as string;

    const { candidateId, fileId } = await createCandidate(
      {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        totalExperience: formData.get("totalExperience") as string,
        relevantExperience: formData.get("relevantExperience") as string,
        currentCompany: formData.get("currentCompany") as string,
        currentDesignation: formData.get("currentDesignation") as string,
        currentLocation: formData.get("currentLocation") as string,
        preferredLocation: formData.get("preferredLocation") as string,
        skills: formData.get("skills") as string,
        noticePeriod: formData.get("noticePeriod") as string,
        currentSalary: formData.get("currentSalary") as string,
        expectedSalary: formData.get("expectedSalary") as string,
        source: formData.get("source") as string,
        recruiter: formData.get("recruiter") as string,
        notes: formData.get("notes") as string,
        resumeBuffer: buffer,
        resumeFileName: resumeFile.name,
        mimeType: resumeFile.type || "application/pdf",
      },
      session.id
    );

    const submissionId = await submitCandidateToJob(selectedJobId, candidateId, fileId, session.id);

    return NextResponse.json({
      success: true,
      data: { candidateId, submissionId },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message || "Failed to process candidate submission." } }, { status: 400 });
  }
}
