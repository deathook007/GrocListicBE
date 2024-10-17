import nodemailer from "nodemailer";
import { User } from "../models/user.modal.js";

interface ISendEmailProps {
  email: string;
  emailType: string;
  userId: any;
}

export const sendEmail = async (props: ISendEmailProps) => {
  const { email, emailType, userId } = props;

  try {
    if (emailType === "VERIFY") {
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "maddison53@ethereal.email",
        pass: "jn7jnAPss4f63QBp6D",
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

    console.log("🚀 ~ sendEmail ~ mailResponse:", mailResponse);
  } catch (error) {
    throw new Error(error?.message || "Send email error");
  }
};
