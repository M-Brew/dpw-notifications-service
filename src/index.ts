import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { initializeSocket } from "./utils/socketManager";
import { initConsumer } from "./kafka/notificationConsumer";

const { PORT } = process.env;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

initializeSocket(server);

initConsumer();

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
