import { Router } from "express";
import { getNotifications,markNotificationsAsRead } from "../controller/notification/notification.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const notificationRouter = Router();

notificationRouter.get('/', protectMiddleware, getNotifications);
notificationRouter.post('/read',protectMiddleware, markNotificationsAsRead);

export default notificationRouter;
