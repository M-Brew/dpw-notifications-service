import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

import { sendEmailValidation } from "../validation/notificationValidation";

const { SEND_GRID_API_KEY, SEND_GRID_SENDER_EMAIL } = process.env;

sgMail.setApiKey(SEND_GRID_API_KEY);

const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
) => {
  if (!SEND_GRID_API_KEY || SEND_GRID_SENDER_EMAIL) {
    console.log("SendGrid credentials not configured.");
    return;
  }

  const { valid, errors } = sendEmailValidation({
    to,
    subject,
    htmlContent,
    textContent,
  });
  if (!valid) {
    console.log({ errors });
    return;
  }

  try {
    await sgMail.send({
      to,
      from: SEND_GRID_SENDER_EMAIL,
      subject,
      html: htmlContent,
      text: textContent,
    });
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.log(`Error sending email to ${to}: ${error.message}`, { error });
    throw error;
  }
};

export { sendEmail };
