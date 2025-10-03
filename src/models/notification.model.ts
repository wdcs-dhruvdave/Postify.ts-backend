import { Schema,model,Document } from "mongoose";
import { NotificationType, CONFIG } from "../constants/constants";

export interface INotification extends Document {
    recipient : string;
    sender : object;
    type : NotificationType;
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
  type: { type: String, enum: Object.values(NotificationType), required: true },
  post: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default model<INotification>(CONFIG.NOTIFICATION.MODEL_NAME, notificationSchema);
