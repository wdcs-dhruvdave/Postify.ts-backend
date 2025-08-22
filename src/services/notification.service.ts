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

  await axios.post("http://localhost:3002/notifications", {
    recipient: recipientId,
    sender: {
      id: sender.id,
      username: sender.username,
      avatar_url: sender.avatar_url,
    },
    type,
    post: postId,
  });
};
