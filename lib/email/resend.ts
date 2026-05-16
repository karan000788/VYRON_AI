import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOTPEmail(to: string, otp: string) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'VYRON AI <noreply@vyron.ai>',
    to,
    subject: 'Your VYRON AI verification code',
    html: `<p>Your verification code is <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
  });
}

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  pdfUrl: string
) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'VYRON AI <noreply@vyron.ai>',
    to,
    subject: `Invoice ${invoiceNumber} from VYRON AI`,
    html: `<p>Your invoice <strong>${invoiceNumber}</strong> is ready.</p><p><a href="${pdfUrl}">Download PDF</a></p>`,
  });
}

export async function sendBillingNotification(
  to: string,
  subject: string,
  body: string
) {
  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'VYRON AI <billing@vyron.ai>',
    to,
    subject,
    html: body,
  });
}
