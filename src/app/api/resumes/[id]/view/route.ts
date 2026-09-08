import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getResumeStreamForDownload } from "@/services/submission.service";
import mammoth from "mammoth";
import { Readable } from "stream";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required to view resume." } },
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

    const ext = fileRecord.fileName.substring(fileRecord.fileName.lastIndexOf(".")).toLowerCase();

    // For Word documents (.docx / .doc), convert to styled HTML so browser renders inline without downloading
    if (ext === ".docx" || ext === ".doc") {
      try {
        const buffer = await streamToBuffer(stream);
        const result = await mammoth.convertToHtml({ buffer });
        const htmlContent = result.value || "<p>No readable text content found in document.</p>";

        const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${fileRecord.fileName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      padding: 2.5rem;
      max-width: 850px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 700;
    }
    p { margin-bottom: 1em; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th { background-color: #f8fafc; font-weight: 600; }
    ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #475569;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

        return new NextResponse(styledHtml, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": "inline",
          },
        });
      } catch (convErr) {
        console.error("Mammoth conversion error:", convErr);
        // If conversion fails, fallback to stream response
      }
    }

    // For PDF files or fallbacks, stream with inline disposition
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    let contentType = fileRecord.mimeType || "application/octet-stream";
    if (ext === ".pdf") {
      contentType = "application/pdf";
    }

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord.fileName)}"`,
        "Content-Length": fileRecord.fileSize.toString(),
      },
    });
  } catch (err: any) {
    const message = err.message || "Failed to view resume file.";
    const status = message.includes("FORBIDDEN") ? 403 : message.includes("NOT_FOUND") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: { code: "VIEW_FAILED", message } },
      { status }
    );
  }
}
