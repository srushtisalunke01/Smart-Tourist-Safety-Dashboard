const nodemailer = require('nodemailer');
const redisConfig = require('../config/redis');

// Normalize environment variables for SMTP authentication
const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER || process.env.EMAIL;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  return { user, pass };
};

// Set up transporter using environment variables or Gmail service
const createTransporter = () => {
  const { user, pass } = getEmailCredentials();
  
  if (process.env.SMTP_SERVICE === 'gmail' || (!process.env.SMTP_HOST && user?.endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: user && pass ? { user, pass } : undefined
  });
};

const sendMailDirect = async (options) => {
  const { user, pass } = getEmailCredentials();

  // Step 5 Audit: Guarantee recipient is always options.to (the user's email)
  const recipientEmail = options.to;
  if (!recipientEmail) {
    console.error('[Mail Error] Recipient email (options.to) is missing!');
    throw new Error('Recipient email address is required.');
  }

  console.log(`[Mail Audit] Dispatching OTP Email to user: ${recipientEmail}`);

  // Fallback simulator if credentials are not configured or set to placeholder
  if (!user || !pass || user === 'safetour.mock.smtp@gmail.com') {
    console.log(`[Mail Simulator] Real SMTP credentials not detected in .env (EMAIL_USER / EMAIL_PASS). Dispatching OTP code for ${recipientEmail} via console log.`);
    return { messageId: 'simulated_mail_' + Date.now() };
  }

  try {
    const transporter = createTransporter();

    // Verify SMTP Transporter before sending
    await transporter.verify();
    console.log('[Mail] SMTP Transporter verified successfully.');

    const mailOptions = {
      from: `"SafeTour AI Support" <${user}>`,
      to: recipientEmail, // MUST always send to the email entered during signup
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail SUCCESS] Email delivered to recipient inbox ${recipientEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mail ERROR] SMTP Delivery failed for ${recipientEmail}:`, error.message);
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('[Mail ERROR] Gmail Authentication Failed! Ensure 2-Step Verification is enabled and a Google App Password (not your account password) is set as EMAIL_PASS in backend/.env.');
    }
  }
};

const sendMail = async (options) => {
  if (redisConfig.isRedisConnected() && redisConfig.emailQueue) {
    try {
      await redisConfig.emailQueue.add('sendEmailJob', options, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
      console.log(`[Mail Queue] Queued email to ${options.to}`);
    } catch (err) {
      console.warn(`[Mail Queue Warning] Falling back to direct send: ${err.message}`);
      await sendMailDirect(options);
    }
  } else {
    await sendMailDirect(options);
  }
};

const sendOtpEmail = async (name, email, otpCode) => {
  const subject = 'Verify your SafeTour AI Account';
  const text = `Hello ${name},\n\nWelcome to SafeTour AI!\n\nYour verification code is: ${otpCode}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not create this account, please ignore this email.\n\nSafeTour AI Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f1f5f9; }
        .container { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 600; margin-top: 4px; }
        .content { padding: 32px 28px; text-align: center; }
        .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { background: #0f172a; border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; margin: 24px 0; display: inline-block; width: 80%; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; font-family: monospace; }
        .expiry-badge { font-size: 12px; color: #f43f5e; font-weight: 700; background: rgba(244,63,94,0.1); padding: 6px 14px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        .footer { background: #0f172a; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-t: 1px solid rgba(255,255,255,0.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ SafeTour AI</div>
          <div class="subtitle">Smart Tourist Safety & Incident Response</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <div class="text">Welcome to SafeTour AI! Please verify your email address to activate your security profile and access safe navigation corridors.</div>
          
          <div class="otp-box">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 8px;">Verification Security Code</div>
            <div class="otp-code">${otpCode}</div>
          </div>

          <div>
            <span class="expiry-badge">⏱️ Valid for 5 minutes</span>
          </div>

          <div class="text" style="font-size: 12px; margin-top: 24px; color: #64748b;">
            If you did not request this verification code, please ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SafeTour AI Team &bull; Empowering Tourist Protection & Safety
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({ to: email, subject, text, html });
};

module.exports = {
  sendMail,
  sendMailDirect,
  sendOtpEmail
};
