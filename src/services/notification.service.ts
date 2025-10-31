import Notification from "../models/notification.model";
import { User } from "../models";
import axios from "axios";

export const createNotification = async (
  recipientId: string | number,
  senderId: string | number,
  type: "like" | "dislike" | "comment" | "follow",
  postId?: string
) => {
  if (recipientId === senderId) return;

  const sender = await User.findByPk(senderId, {
    attributes: ["id", "username", "avatar_url"],
  });

  if (!sender) return;

  try {
    // Send to FCM-enabled notification service with correct format
    await axios.post("http://localhost:3003/notifications", {
      recipientId: recipientId,
      senderId: senderId,
      type,
      postId: postId,
    });
    
    console.log(`Notification sent: ${type} from ${senderId} to ${recipientId}`);
  } catch (error: unknown) {
    const notificationError = error as Error;
    console.error('Error sending notification:', notificationError.message);
  }
};
