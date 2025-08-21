import mongoose from "mongoose";

export const connectMongoDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/postify_notifications", {
      serverSelectionTimeoutMS: 5000,
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
