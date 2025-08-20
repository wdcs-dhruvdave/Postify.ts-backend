import mongoose from "mongoose";

export const connectMongoDb = async() =>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/postify_notifications")
        console.log("MongoDB connected successfully");
    }
    catch(err){
        console.error("MongoDB connection failed:", err);
    }
}