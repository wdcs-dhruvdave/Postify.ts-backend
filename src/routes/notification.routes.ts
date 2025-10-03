import { Router } from "express";
import { getNotifications,markNotificationsAsRead } from "../controller/notification/notification.controller";
import { protectMiddleware } from "../middleware/auth.middleware";
import { ROUTES } from "../constants/constants";

const notificationRouter = Router();

notificationRouter.use(protectMiddleware);

notificationRouter.get('/', getNotifications);
notificationRouter.post(ROUTES.NOTIFICATIONS.READ, markNotificationsAsRead);

export default notificationRouter;
