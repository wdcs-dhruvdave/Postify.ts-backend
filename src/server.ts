import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import indexRouter from "./routes/index.routes";
import { connectDB } from "./config/database";
import connectMongoDb from "./config/mongo";
import { initializeActivityListerner } from "./services/activity-logging-service";
import { calculateInterestScores } from "./scripts/calculate-interests";
import { CONFIG } from "./constants/constants";
import { errorLoggerMiddleware, entryLoggerMiddleware } from "./utils/logger";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(entryLoggerMiddleware);
app.use(errorLoggerMiddleware);
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(CONFIG.API_PREFIX, indexRouter);

app.get("/", (req, res) => {
  res.send("Hello from server.ts backend!");
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User with socket ID ${socket.id} joined room ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(" A user disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await connectMongoDb();
    initializeActivityListerner();
    await calculateInterestScores();

    setInterval(calculateInterestScores, CONFIG.ONE_MINUTE_IN_MS);

    server.listen(CONFIG.SERVER_PORT, () => {
      console.log(`🚀 Server running at http://localhost:${CONFIG.SERVER_PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export { io, app, server, startServer };
