"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("There was an error sending the email. Please try again later.");
    }
};
exports.sendEmail = sendEmail;
