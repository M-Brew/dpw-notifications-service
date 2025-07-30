import { Kafka } from "kafkajs";

import config from "../config";
import { sendNotificationToUser } from "../utils/socketManager";
import { sendPushNotification } from "../services/pushNotificationService";
import { sendEmail } from "../services/emailService";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

const initConsumer = async () => {
  try {
    await createTopicsIfNeeded(config.kafka.topics);

    await consumer.connect();
    await consumer.subscribe({
      topics: config.kafka.topics,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log(
          `Received message from Kafka topic ${topic}: ${JSON.stringify(event)}`
        );

        if (topic === "transaction-events") {
          if (
            event.type === "transaction_completed" &&
            event.status === "SUCCESS"
          ) {
            const {
              transactionId,
              senderUserId,
              receiverUserId,
              amount,
              currency,
              transactionType,
            } = event;

            const messageSender = `Your ${transactionType} of ${amount} ${currency} (ID: ${transactionId}) was successful.`;
            // TODO: fetch user contact info from user management service
            // const senderContact = await getUserContactInfo(senderUserId);

            // SMS Notification for Sender
            // if (senderContact.phoneNumber) sendSms(senderContact.phoneNumber, messageSender);
            // if (senderContact.email) sendEmail(senderContact.email, `Transaction ${transactionType} Success!`, `<p>${messageSender}</p>`, messageSender);
            sendNotificationToUser(senderUserId, "transaction_update", {
              message: messageSender,
              type: "success",
              transactionId,
            });
            sendPushNotification(
              "SENDER_DEVICE_TOKEN", // TODO: Replace with sender's actual token
              `Transaction Success: ${transactionType}`,
              messageSender,
              { transactionId }
            );

            if (receiverUserId) {
              // For P2P
              const messageReceiver = `You received ${amount} ${currency} from User ${senderUserId} (ID: ${transactionId}).`;
              // TODO: fetch user contact info from user management service
              // const receiverContact = await getUserContactInfo(receiverUserId);
              // if (receiverContact.phoneNumber) sendSms(receiverContact.phoneNumber, messageReceiver);
              // if (receiverContact.email) sendEmail(receiverContact.email, `Funds Received!`, `<p>${messageReceiver}</p>`, messageReceiver);
              sendNotificationToUser(receiverUserId, "transaction_update", {
                message: messageReceiver,
                type: "credit",
                transactionId,
              });
              sendPushNotification(
                "RECEIVER_DEVICE_TOKEN", // TODO: Replace with receiver's actual token
                `Funds Received!`,
                messageReceiver,
                { transactionId }
              );
            }
          } else if (
            event.type === "transaction_failed" &&
            event.status === "FAILED"
          ) {
            const {
              transactionId,
              senderUserId,
              amount,
              currency,
              transactionType,
              reason,
            } = event;
            const message = `Your ${transactionType} of ${amount} ${currency} (ID: ${transactionId}) failed. Reason: ${
              reason || "Unknown"
            }.`;
            sendNotificationToUser(senderUserId, "transaction_update", {
              message,
              type: "failure",
              transactionId,
              reason,
            });
            sendPushNotification(
              "SENDER_DEVICE_TOKEN",
              `Transaction Failed!`,
              message,
              { transactionId }
            );
          }
        } else if (topic === "user-events") {
          if (event.type === "password_reset_requested") {
            const { userId, email, resetLink } = event;
            const subject = "Password Reset Request";
            const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
            const text = `Reset your password: ${resetLink}`;
            sendEmail(email, subject, html, text);
            console.log(
              `Password reset email sent to ${email} for user ${userId}`
            );
          }
        }
      },
    });
    console.log("Kafka notification consumer connected");
    // TODO: Lots more events to be added
  } catch (error) {
    console.log("Error connecting Kafka consumer:", error);
    setTimeout(initConsumer, 5000);
  }
};

async function createTopicsIfNeeded(topicNames: string[]) {
  if (config.environment === "production") return;

  const admin = kafka.admin();
  await admin.connect();

  try {
    const topics = await admin.listTopics();
    for (let topicName of topicNames) {
      if (topics.includes(topicName)) return;

      console.log(`Creating the ${topicName} topic`);
      await admin.createTopics({
        topics: [
          {
            topic: topicName,
            numPartitions: 1,
          },
        ],
      });
    }
  } finally {
    await admin.disconnect();
  }
}

export { initConsumer };
