import authRouter from './auth.routes';
import postRouter from './post.routes';
import commentRouter from './comment.routes';
import { Router } from 'express';
import userRouter from './user.routes';
import notificationRouter from './notification.routes';
import { ROUTES } from '../constants/constants';

const indexRouter = Router();

indexRouter.use(ROUTES.AUTH.BASE, authRouter);
indexRouter.use(ROUTES.POSTS.BASE, postRouter);
indexRouter.use('/posts/:postId/comments', commentRouter);
indexRouter.use(ROUTES.USERS.BASE, userRouter);
indexRouter.use(ROUTES.NOTIFICATIONS.BASE, notificationRouter);

export default indexRouter;
