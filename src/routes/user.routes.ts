import { Router } from 'express';
import { searchUsers, followUser, unfollowUser, getFollowSuggestions, getUserProfile, getPostsByUsername, updateUserProfile, updatePrivacy, getFollowers, getFollowing, getRandomUsers } from '../controller/user/user.controller';
import { identifyUser, protectMiddleware } from '../middleware/auth.middleware';

const userRouter = Router();

userRouter.get('/search',protectMiddleware, searchUsers); 
userRouter.get('/suggestions', protectMiddleware, getFollowSuggestions);
userRouter.post('/:id/follow', protectMiddleware, followUser);
userRouter.delete('/:id/follow', protectMiddleware, unfollowUser);
userRouter.get('/:username', identifyUser, getUserProfile);
userRouter.get('/:username/posts', identifyUser, getPostsByUsername);
userRouter.put('/profile', protectMiddleware, updateUserProfile);
userRouter.put('/profile/privacy', protectMiddleware, updatePrivacy);
userRouter.get('/:username/followers', identifyUser, getFollowers);
userRouter.get('/:username/following', identifyUser, getFollowing);
userRouter.get('/explore/suggestions', protectMiddleware, getRandomUsers);



export default userRouter;