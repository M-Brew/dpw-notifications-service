import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 5004,
  environment: process.env.NODE_ENV,
  kafka: {
    brokers: process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",")
      : ["localhost:9092"],
    clientId: "notification-service",
    groupId: "notification-service-group",
    topics: [
      "transaction-events",
      "user-events", // e.g., for password resets, profile updates
      // Add other event topics here
    ],
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDGRID_SENDER_EMAIL,
  },
  fcmServiceAccountKey: process.env.FCM_SERVICE_ACCOUNT_KEY_PATH, // Path to your Firebase service account JSON
};
