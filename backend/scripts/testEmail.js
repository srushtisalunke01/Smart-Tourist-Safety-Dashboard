const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');
const { sendOtpEmail } = require('../src/services/mail.service');

async function runEmailAuditTest() {
  console.log('====================================================');
  console.log(' STEP 6 – ENVIRONMENT VARIABLES AUDIT');
  console.log('====================================================');

  const user = process.env.EMAIL_USER || process.env.EMAIL;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  console.log('EMAIL_USER / EMAIL loaded?:', user ? `YES (${user})` : 'NO (Missing)');
  console.log('EMAIL_PASS / EMAIL_PASSWORD exists?:', pass ? 'YES (Configured)' : 'NO (Missing)');

  if (!user || !pass || user === 'safetour.mock.smtp@gmail.com') {
    console.log('\n⚠️ Notice: Real SMTP credentials not configured in backend/.env.');
    console.log('To send real emails to your Gmail inbox:');
    console.log('1. Open backend/.env');
    console.log('2. Add:');
    console.log('   EMAIL_USER=yourgmail@gmail.com');
    console.log('   EMAIL_PASS=your-16-digit-google-app-password');
    console.log('3. Run node scripts/testEmail.js again.');
    console.log('\n[Simulator Test Execution]');
    await sendOtpEmail('Test Traveler', 'user_signup_test@gmail.com', '123456');
    return;
  }

  console.log('\n====================================================');
  console.log(' STEP 4 – NODEMAILER TRANSPORTER VERIFICATION');
  console.log('====================================================');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    console.log('Testing SMTP connection with await transporter.verify()...');
    await transporter.verify();
    console.log('✔ Nodemailer Transporter Verified Successfully!');

    console.log('\n====================================================');
    console.log(' STEP 5 & 10 – TEST EMAIL DELIVERY TO SIGNUP EMAIL');
    console.log('====================================================');

    const testRecipient = user; // Send test email to configured address
    console.log(`Sending live OTP verification email to: ${testRecipient}...`);

    await sendOtpEmail('SafeTour Tester', testRecipient, '583921');
    console.log(`\n🎉 SUCCESS! Test Email delivered to ${testRecipient}. Please check your Gmail inbox/spam folder.`);

  } catch (err) {
    console.error('\n❌ SMTP Verification / Sending Failed!');
    console.error('Exact Error:', err.message);
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      console.error('\n💡 Root Cause & Fix for Gmail 535 Error:');
      console.error('1. You are using your normal Gmail account password instead of a Google App Password.');
      console.error('2. Go to https://myaccount.google.com/apppasswords');
      console.error('3. Enable 2-Step Verification and generate a 16-character "App Password".');
      console.error('4. Paste that 16-character key into EMAIL_PASS in backend/.env.');
    }
  }
}

runEmailAuditTest();
