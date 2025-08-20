import Notification from '../models/notification.model';
import { User } from '../models'; 

export const createNotification = async (
  recipientId: string, 
  senderId: string, 
  type: 'like' | 'dislike' | 'comment' | 'follow', 
  postId?: string
) => {
  if (recipientId === senderId) return;

  const sender = await User.findByPk(senderId, {
    attributes: ['id', 'username', 'avatar_url']
  });

  if (!sender) return;

  await Notification.create({
    recipient: recipientId,
    sender: sender.toJSON(),
    type,
    post: postId,
  });
};