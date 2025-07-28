import { Router } from 'express';
import { searchUsers, followUser, unfollowUser, getFollowSuggestions, getUserProfile } from '../controller/user/user.controller';
import { protectMiddleware } from '../middleware/auth.middleware';

const userRouter = Router();

userRouter.get('/search', searchUsers); 
userRouter.get('/suggestions', protectMiddleware, getFollowSuggestions);
userRouter.post('/:id/follow', protectMiddleware, followUser);
userRouter.delete('/:id/follow', protectMiddleware, unfollowUser);
userRouter.get('/:username', getUserProfile);


export default userRouter;