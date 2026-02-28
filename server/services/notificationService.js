const nodemailer = require('nodemailer');

let transporter;

const APP_NAME = 'Recruitment Management System';

const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
};

const getTransporter = () => {
  if (transporter) return transporter;

  const smtpPort = Number(process.env.SMTP_PORT);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/* ── Branded HTML wrapper ── */
const wrapHtml = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">${APP_NAME}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px 12px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #eee;color:#888;font-size:12px;">
            This is an automated message from ${APP_NAME}. Please do not reply directly to this email.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    return {
      success: false,
      skipped: true,
      reason: 'missing-recipient',
    };
  }

  if (!isSmtpConfigured()) {
    console.warn(`SMTP is not configured. Skipping email to: ${to}`);
    return {
      success: false,
      skipped: true,
      reason: 'smtp-not-configured',
    };
  }

  try {
    const mailer = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    const result = await mailer.sendMail({
      from: `"${APP_NAME}" <${fromAddress}>`,
      replyTo: fromAddress,
      to,
      subject: `${subject} — ${APP_NAME}`,
      text,
      html,
    });

    console.log(`✅ Email sent to ${to} | subject: "${subject}" | messageId: ${result.messageId}`);

    return {
      success: true,
      skipped: false,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);

    return {
      success: false,
      skipped: false,
      reason: 'send-failed',
      error: error.message,
    };
  }
};

/* ── HR Approval / Disapproval ── */
const sendHrApprovalEmail = async ({ to, username, isApproved }) => {
  const subject = isApproved ? 'Your HR Account Has Been Approved' : 'Your HR Account Has Been Disapproved';

  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusLabel = isApproved ? 'APPROVED' : 'DISAPPROVED';
  const bodyLines = isApproved
    ? `Your HR account has been <strong>approved</strong> by the administrator.
       You can now log in and start posting & managing job listings.`
    : `Your HR account has been <strong>disapproved</strong> by the administrator.
       If you believe this is an error, please contact the admin for further assistance.`;

  const text = isApproved
    ? `Hi ${username}, your HR account has been approved by admin. You can now post and manage jobs.`
    : `Hi ${username}, your HR account has been disapproved by admin. Please contact support/admin for more details.`;

  const html = wrapHtml(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Hello ${username},</h2>
    <div style="display:inline-block;padding:6px 14px;border-radius:4px;background:${statusColor};color:#fff;font-weight:bold;font-size:13px;margin-bottom:16px;">
      ${statusLabel}
    </div>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:16px 0;">
      ${bodyLines}
    </p>
  `);

  return sendEmail({ to, subject, text, html });
};

/* ── Application Submitted ── */
const sendApplicationSubmittedEmail = async ({ to, candidateName, jobTitle }) => {
  const subject = 'Application Submitted Successfully';
  const text = `Hi ${candidateName}, your application for "${jobTitle}" has been submitted successfully.`;

  const html = wrapHtml(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Hello ${candidateName},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Your application for <strong>${jobTitle}</strong> has been submitted successfully.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      We will notify you when the hiring team updates your application status. Good luck!
    </p>
  `);

  return sendEmail({ to, subject, text, html });
};

/* ── Application Status Update ── */
const sendApplicationStatusEmail = async ({ to, candidateName, jobTitle, status }) => {
  const subject = 'Application Status Updated';
  const text = `Hi ${candidateName}, your application status for "${jobTitle}" has been updated to: ${status}.`;

  const statusColors = {
    shortlisted: '#2563eb',
    accepted: '#16a34a',
    rejected: '#dc2626',
  };
  const badgeColor = statusColors[status?.toLowerCase()] || '#6366f1';

  const html = wrapHtml(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Hello ${candidateName},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Your application status for <strong>${jobTitle}</strong> has been updated:
    </p>
    <div style="display:inline-block;padding:6px 14px;border-radius:4px;background:${badgeColor};color:#fff;font-weight:bold;font-size:14px;margin:8px 0 16px;">
      ${(status || '').toUpperCase()}
    </div>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Log in to your account to view more details.
    </p>
  `);

  return sendEmail({ to, subject, text, html });
};

/* ── Job Closed ── */
const sendJobClosedEmail = async ({ to, candidateName, jobTitle, reason }) => {
  const reasonText =
    reason === 'vacancies-filled'
      ? 'all vacancies have been filled'
      : 'it has been manually closed by the hiring team';

  const subject = 'Job Closed Notification';
  const text = `Hi ${candidateName}, the job "${jobTitle}" is now closed because ${reasonText}.`;

  const html = wrapHtml(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Hello ${candidateName},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      The job position <strong>${jobTitle}</strong> has been closed because ${reasonText}.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Thank you for your interest. Keep checking for new openings!
    </p>
  `);

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendHrApprovalEmail,
  sendApplicationSubmittedEmail,
  sendApplicationStatusEmail,
  sendJobClosedEmail,
};
