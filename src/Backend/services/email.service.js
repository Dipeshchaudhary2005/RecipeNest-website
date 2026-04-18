const nodemailer = require("nodemailer");
const { 
  EMAIL_HOST, 
  EMAIL_PORT, 
  EMAIL_USER, 
  EMAIL_PASS, 
  EMAIL_FROM,
  CLIENT_URL 
} = require("../config/config");

/**
 * Configure the SMTP transporter
 */
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Send Password Reset Email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit reset code
 */
const sendResetPasswordEmail = async (email, code) => {
  try {
    const resetUrl = `${CLIENT_URL}?page=forgot-password&email=${encodeURIComponent(email)}&code=${code}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Reset Your Password - RecipeNest",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background-color: #fff; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #ff6b6b; font-family: 'Georgia', serif; }
            .content { margin-bottom: 30px; }
            .code-container { text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2d3436; }
            .button-container { text-align: center; margin-top: 30px; }
            .button { background-color: #ff6b6b; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍽 RecipeNest</div>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset your RecipeNest password. Please use the following 6-digit verification code to proceed:</p>
              
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              
              <p>Alternatively, you can click the button below to go directly to the password reset page:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password Now</a>
              </div>
              
              <p>This code will expire in 15 minutes. If you did not request this, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RecipeNest. All rights reserved.</p>
              <p>Tasty recipes, happy cooking!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email. Please try again later.");
  }
};

module.exports = {
  sendResetPasswordEmail,
};
