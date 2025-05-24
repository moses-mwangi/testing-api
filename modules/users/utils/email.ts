import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: String(process.env.EMAIL_HOST),
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: String(process.env.EMAIL_USERNAME),
      pass: String(process.env.EMAIL_PASSWORD),
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: String(process.env.EMAIL_FROM),
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      "There was an error sending the email. Please try again later."
    );
  }
};
