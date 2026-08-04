const nodemailer = require('nodemailer');
const redisConfig = require('../config/redis');

// Set up transporter using environment variables or a fallback ethereal mailer account
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL || 'safetour.mock.smtp@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'mock_pass_12345'
    }
  });
};

const sendMailDirect = async (options) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"SafeTour AI Support" <${process.env.EMAIL || 'safetour.mock.smtp@gmail.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] Direct email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mail] Direct mail sending error: ${error.message}`);
  }
};

const sendMail = async (options) => {
  // If Redis is active, queue the task for background BullMQ processing
  if (redisConfig.isRedisConnected() && redisConfig.emailQueue) {
    try {
      await redisConfig.emailQueue.add('sendEmailJob', options, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });
      console.log(`[Mail] Email queued successfully for background job: ${options.subject}`);
    } catch (err) {
      console.warn(`[Mail] Failed to queue job, falling back to direct sending: ${err.message}`);
      await sendMailDirect(options);
    }
  } else {
    // If Redis is offline, send directly to avoid blocking or dropping emails
    await sendMailDirect(options);
  }
};

module.exports = {
  sendMail,
  sendMailDirect
};
