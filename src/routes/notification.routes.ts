import { Router } from "express";
import { getNotifications,markNotificationsAsRead } from "../controller/notification/notification.controller";
import { protectMiddleware } from "../middleware/auth.middleware";
import { ROUTES } from "../constants/constants";

const notificationRouter = Router();

notificationRouter.get('/', protectMiddleware, getNotifications);
notificationRouter.post(ROUTES.NOTIFICATIONS.READ,protectMiddleware, markNotificationsAsRead);

export default notificationRouter;
