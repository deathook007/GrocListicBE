import nodemailer from "nodemailer";
import { User } from "../models/user.modal.js";
import bcrypt from "bcrypt";

export const sendEmail = async (props) => {
  const { email, emailType, userId } = props;

  const tokenHash = await bcrypt.hash(userId.toString(), 10);

  try {
    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          verifyToken: tokenHash,
          verifyTokenExpiry: new Date(Date.now() + 86400000), // 1 day from now
        },
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          forgotPasswordToken: tokenHash,
          forgotPasswordTokenExpiry: new Date(Date.now() + 86400000), // 1 day from now
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: "deepak.shivay.bhatt@gmail.com",
      to: email,
      subject:
        emailType === "VERIFY"
          ? "Verify your email ✔"
          : "Reset your password ✔",
      text: "",
      html:
        emailType === "VERIFY"
          ? `<p>Hello,</p>
             <p>Thank you for registering with us! To complete your registration, please verify your email by clicking the link below. This helps ensure the security of your account. If you did not register, please ignore this email or contact our support team.</p>
             <p><a href="[VerificationLink]">Verify your email</a></p>
             <p>Best regards,</p>
             <p><b>GrocListic Team</b></p>`
          : `<p>Hello,</p>
             <p>We received a request to reset your password. You can reset your password by clicking the link below. If you did not request a password reset, please ignore this email or contact our support team.</p>
             <p><a href="[VerificationLink]">Reset your password</a></p>
             <p>Best regards,</p>
             <p><b>GrocListic Team</b></p>`,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error?.message || "Send email error");
  }
};
