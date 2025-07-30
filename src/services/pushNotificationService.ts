import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const { FCM_SERVICE_ACCOUNT_KEY } = process.env;

let firebaseAppInitialized = false;

if (FCM_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = require(FCM_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseAppInitialized = true;
    console.log("Firebase Admin SDK initialized for FCM.");
  } catch (err) {
    console.log(
      `Failed to initialize Firebase Admin SDK. Check FCM_SERVICE_ACCOUNT_KEY_PATH: ${err.message}`
    );
    firebaseAppInitialized = false;
  }
} else {
  console.log(
    "FCM_SERVICE_ACCOUNT_KEY_PATH not provided. Push notifications via FCM will be disabled."
  );
}

const sendPushNotification = async (
  deviceToken: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
) => {
  if (!firebaseAppInitialized) {
    console.log(
      "Firebase Admin SDK not initialized. Skipping push notification."
    );
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      title, // Include title and body in data for more flexibility
      body,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // For Flutter apps
    },
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Successfully sent FCM message to ${deviceToken}: ${response}`);
    return response;
  } catch (error) {
    console.log(
      `Error sending FCM message to ${deviceToken}: ${error.message}`,
      { error }
    );
    throw error;
  }
};

export { sendPushNotification };
