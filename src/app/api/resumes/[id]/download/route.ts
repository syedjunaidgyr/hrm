import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getResumeStreamForDownload } from "@/services/submission.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required to download resume." } },
        { status: 401 }
      );
    }

    const { id: fileId } = await params;

    const { stream, fileRecord } = await getResumeStreamForDownload(
      fileId,
      session.id,
      session.role,
      session.vendorId
    );

    // Convert NodeJS.Readable stream into ReadableStream for Web Response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": fileRecord.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileRecord.fileName)}"`,
        "Content-Length": fileRecord.fileSize.toString(),
      },
    });
  } catch (err: any) {
    const message = err.message || "Failed to download resume file.";
    const status = message.includes("FORBIDDEN") ? 403 : message.includes("NOT_FOUND") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: { code: "DOWNLOAD_FAILED", message } },
      { status }
    );
  }
}
