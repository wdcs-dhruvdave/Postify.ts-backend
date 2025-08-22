import authRouter from './auth.routes';
import postRouter from './post.routes';
import commentRouter from './comment.routes';
import { Router } from 'express';
import userRouter from './user.routes';
import notificationRouter from './notification.routes';

const indexRouter = Router();

indexRouter.use('/auth', authRouter);
indexRouter.use('/posts', postRouter);
indexRouter.use('/comments', commentRouter);
indexRouter.use('/users', userRouter);
indexRouter.use('/notifications', notificationRouter);

export default indexRouter;
