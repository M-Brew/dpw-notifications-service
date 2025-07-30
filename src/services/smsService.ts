import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

import { sendSmsValidation } from "../validation/notificationValidation";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendSms = async (to: string, body: string) => {
  if (!TWILIO_ACCOUNT_SID || TWILIO_AUTH_TOKEN) {
    console.log("Twilio credentials not configured.");
    return;
  }

  const { valid, errors } = sendSmsValidation({ to, body });
  if (!valid) {
    console.log({ errors });
    return;
  }

  try {
    const message = await client.messages.create({
      body,
      to,
      from: TWILIO_PHONE_NUMBER,
    });
    console.log(`SMS sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    console.log(`Error sending SMS to ${to}: ${error.message}`, { error });
    throw error;
  }
};

export { sendSms };
