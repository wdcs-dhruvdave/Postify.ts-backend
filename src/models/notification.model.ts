import { Schema,model,Document } from "mongoose";

export interface INotification extends Document {
    recipient : string;
    sender : object;
    type : 'like' | 'dislike' | 'comment' | 'follow';
    post? : string,
    read : boolean
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: String, required: true, index: true },
  sender: {
    id: { type: String, required: true },
    username: { type: String, required: true },
    avatar_url: { type: String }
  },
  type: { type: String, enum: ['like', 'dislike', 'comment', 'follow'], required: true },
  post: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default model<INotification>('Notification', notificationSchema);
