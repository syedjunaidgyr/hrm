import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
  messageId?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

/**
 * Send an email via SMTP. Fails softly when SMTP is not configured —
 * logs the error and returns { sent: false } so callers can continue
 * with in-app notifications.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@rightfit.local";
  const defaultCc = process.env.SMTP_CC;

  const toList = Array.isArray(params.to) ? params.to.filter(Boolean) : [params.to].filter(Boolean);
  if (toList.length === 0) {
    console.warn("[email] No recipients — skipping send.");
    return { sent: false, error: "NO_RECIPIENTS" };
  }

  if (!transporter) {
    console.warn("[email] SMTP_HOST not configured — email not sent.", {
      to: toList,
      subject: params.subject,
    });
    return { sent: false, error: "SMTP_NOT_CONFIGURED" };
  }

  const ccList: string[] = [];
  if (params.cc) {
    ccList.push(...(Array.isArray(params.cc) ? params.cc : [params.cc]));
  }
  if (defaultCc) {
    ccList.push(...defaultCc.split(",").map((s) => s.trim()).filter(Boolean));
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: toList.join(", "),
      cc: ccList.length ? ccList.join(", ") : undefined,
      subject: params.subject,
      html: params.html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[email] Failed to send:", err?.message || err);
    return { sent: false, error: err?.message || "SEND_FAILED" };
  }
}
