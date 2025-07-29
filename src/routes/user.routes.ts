import { Router } from 'express';
import { searchUsers, followUser, unfollowUser, getFollowSuggestions, getUserProfile, getPostsByUsername } from '../controller/user/user.controller';
import { identifyUser, protectMiddleware } from '../middleware/auth.middleware';

const userRouter = Router();

userRouter.get('/search',protectMiddleware, searchUsers); 
userRouter.get('/suggestions', protectMiddleware, getFollowSuggestions);
userRouter.post('/:id/follow', protectMiddleware, followUser);
userRouter.delete('/:id/follow', protectMiddleware, unfollowUser);
userRouter.get('/:username', identifyUser, getUserProfile);
userRouter.get('/:username/posts', getPostsByUsername);


export default userRouter;