export async function sendOTP(toEmail: string, recipientName: string, code: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Student Management <onboarding@resend.dev>',
      to: toEmail,
      subject: `Your login code: ${code}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.10)">
          <div style="background:#0f172a;padding:28px 36px;text-align:center">
            <h1 style="color:#38bdf8;margin:0;font-size:18px;letter-spacing:2px;text-transform:uppercase">🎓 Student Management</h1>
          </div>
          <div style="padding:36px;color:#1e293b;line-height:1.7">
            <p>Hi ${recipientName},</p>
            <p>Your one-time login code is:</p>
            <div style="background:#f8fafc;border:2px dashed #38bdf8;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
              <div style="font-size:38px;font-weight:700;letter-spacing:12px;color:#0f172a;font-family:monospace">${code}</div>
              <div style="font-size:13px;color:#64748b;margin-top:6px">Expires in 10 minutes · Do not share</div>
            </div>
            <p>If you did not request this, ignore this email.</p>
          </div>
          <div style="background:#f8fafc;padding:16px 36px;text-align:center;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} Student Management System</div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend error: ${error}`);
  }
}
