import mongoose from "mongoose";
import { ENV } from "../constants/constants";

export const connectMongoDb = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: ENV.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); 
  }
  mongoose.connection.on("connected", () => {
  console.log("Mongo connection state: connected");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongo connection error:", err);
  });
}

export default connectMongoDb;
