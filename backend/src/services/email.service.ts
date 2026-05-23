import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTP(toEmail: string, recipientName: string, code: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:0}
  .wrap{max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.10)}
  .head{background:#0f172a;padding:28px 36px;text-align:center}
  .head h1{color:#38bdf8;margin:0;font-size:18px;letter-spacing:2px;text-transform:uppercase}
  .body{padding:36px;color:#1e293b;line-height:1.7}
  .code-box{background:#f8fafc;border:2px dashed #38bdf8;border-radius:12px;padding:24px;text-align:center;margin:24px 0}
  .code{font-size:38px;font-weight:700;letter-spacing:12px;color:#0f172a;font-family:'Courier New',monospace}
  .note{font-size:13px;color:#64748b;margin-top:6px}
  .foot{background:#f8fafc;padding:16px 36px;text-align:center;color:#94a3b8;font-size:12px}
</style>
</head>
<body>
<div class="wrap">
  <div class="head"><h1>🎓 Student Management</h1></div>
  <div class="body">
    <p>Hi ${recipientName},</p>
    <p>Someone (hopefully you) just tried to sign in. Here is your one-time login code:</p>
    <div class="code-box">
      <div class="code">${code}</div>
      <div class="note">Expires in 10 minutes · Do not share this code</div>
    </div>
    <p>If you did not request this, you can safely ignore this email.</p>
  </div>
  <div class="foot">© ${new Date().getFullYear()} Student Management System</div>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Student Management" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your login code: ${code}`,
    text: `Your login code is ${code}. It expires in 10 minutes.`,
    html,
  });
}
