require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAILS,
      subject: "Test Email from LMS Project",
      text: "This is a test email. If you received this, SMTP works!"
    });

    console.log("Email sent:", info.response);
  } catch (err) {
    console.log("Error:", err);
  }
}

sendTestMail();
