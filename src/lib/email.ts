import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTP(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"HB CLASSES" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP - HB CLASSES',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #07091a; color: #e8eaf6;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: 'Syne', sans-serif; font-size: 28px; background: linear-gradient(135deg, #fff 30%, #6da8ff 80%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">HB CLASSES</h1>
            <p style="color: #8892b0; margin-top: 8px; font-size: 14px;">Online English Coaching Platform</p>
          </div>

          <div style="background: #0f1326; border: 1px solid #1e2545; border-radius: 16px; padding: 30px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 20px; color: #c5cff5;">Hello ${name || 'Student'},</p>
            <p style="font-size: 15px; color: #8892b0; margin-bottom: 25px; line-height: 1.6;">Your One-Time Password (OTP) for login is:</p>

            <div style="background: rgba(30,110,245,0.15); border: 1px solid rgba(30,110,245,0.4); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6da8ff;">${otp}</span>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">This OTP will expire in <strong style="color: #f59e0b;">30 minutes</strong>.</p>
            <p style="font-size: 12px; color: #475569; margin-top: 15px;">If you didn't request this OTP, please ignore this email.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e2545;">
            <p style="font-size: 12px; color: #475569;">© 2024 HB CLASSES. All rights reserved.</p>
            <p style="font-size: 11px; color: #334155; margin-top: 5px;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}