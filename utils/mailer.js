const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send notification when a new lead is created
exports.sendNewLeadNotifications = async (lead) => {
  try {
    console.log("📧 Preparing to send lead email...");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAILS,
      subject: `New Lead Received from ${lead.source}`,
      text: `Lead Details:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Service: ${lead.service}
Source: ${lead.source}
Created At: ${lead.createdAt}`,
    });

    console.log("📨 Email sent successfully:", info.response);

  } catch (err) {
    console.log("❌ Email sending failed:", err);
  }
};
