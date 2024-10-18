import nodemailer from "nodemailer";
import { User } from "../models/user.modal.js";
import bcrypt from "bcrypt";

export const sendEmail = async (props) => {
  const { email, emailType, userId } = props;

  const hash = await bcrypt.hash(userId.toString(), 10);

  try {
    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hash,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hash,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
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
      text: "Testing",
      html: "<b>Testing?</b>",
    };

    const mailResponse = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error?.message || "Send email error");
  }
};
