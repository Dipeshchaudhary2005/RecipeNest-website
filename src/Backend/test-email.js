require("dotenv").config();
const nodemailer = require("nodemailer");

async function testConnection() {
  console.log("--- Email Connection Test ---");
  console.log("Using Host:", process.env.EMAIL_HOST);
  console.log("Using Port:", process.env.EMAIL_PORT);
  console.log("Using User:", process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log("Attempting to verify connection...");
    await transporter.verify();
    console.log("✅ SUCCESS: Connection to Gmail is established!");

    console.log("Sending a test email to yourself...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: "RecipeNest - Email Test",
      text: "If you see this, your Gmail SMTP setup is working perfectly! 🚀",
      html: "<b>If you see this, your Gmail SMTP setup is working perfectly! 🚀</b>",
    });

    console.log("✅ SUCCESS: Test email sent! Message ID:", info.messageId);
    console.log("Check your Gmail inbox (and Spam folder) to see it!");
  } catch (error) {
    console.error("❌ FAILURE: Could not connect to Gmail.");
    console.error("Error Detail:", error.message);
    
    if (error.message.includes("EAUTH")) {
      console.log("\n💡 TIP: 'EAUTH' usually means the App Password is wrong or not generated correctly.");
    }
  }
}

testConnection();
