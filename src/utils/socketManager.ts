import { DefaultEventsMap, Server } from "socket.io";

import { verifyToken } from "../services/authService";

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
const userSocketMap = new Map();

const initializeSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // middleware to validate token sent from client
  // userId gotten from token is attached to socket and made accessible to other socket functions
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = await verifyToken(token);
      console.log({ user });
      if (!user) return next(new Error("Authentication error"));

      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // on connection an entry is made into the in-memory socket map with the user id as the key and a set of socket ids as the value
  // TODO: consider moving from in-memory map to database
  io.on("connection", (socket) => {
    const { userId } = socket.data;
    if (userId) {
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
      console.log(`User ${userId} authenticated socket ${socket.id}`);
    } else {
      console.log(`Unauthenticated socket ${socket.id} tried to authenticate.`);
      socket.disconnect(true); // Disconnect if authentication fails
    }

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (userId) {
        const sockets = userSocketMap.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSocketMap.delete(userId);
          }
        }
        console.log(`User ${userId}'s socket ${socket.id} removed.`);
      }
    });
  });

  console.log("Socket initialized");
};

const sendNotificationToUser = (
  userId: string,
  eventName: string,
  data: any
) => {
  const sockets = userSocketMap.get(userId);
  if (sockets && sockets.size > 0) {
    sockets.forEach((socketId: string) => {
      io.to(socketId).emit(eventName, data);
      console.log(
        `Sent WebSocket event '${eventName}' to user ${userId} on socket ${socketId}.`
      );
    });
  } else {
    console.log(`No active WebSocket connections for user ${userId}.`);
  }
};

export { initializeSocket, sendNotificationToUser };
