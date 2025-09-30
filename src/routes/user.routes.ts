import { Router } from 'express';
import { searchUsers, followUser, unfollowUser, getFollowSuggestions, getUserProfile, getPostsByUsername, updateUserProfile, updatePrivacy, getFollowers, getFollowing, getRandomUsers } from '../controller/user/user.controller';
import { identifyUser, protectMiddleware } from '../middleware/auth.middleware';
import { emitActivityLog } from '../middleware/activity-logging-middleware';
import { ROUTES } from '../constants/constants';

const userRouter = Router();

userRouter.get(ROUTES.USERS.SEARCH,protectMiddleware, searchUsers); 
userRouter.get(ROUTES.USERS.SUGGESTIONS, protectMiddleware, getFollowSuggestions);
userRouter.post('/:id/follow', protectMiddleware, emitActivityLog("follow"), followUser);
userRouter.delete('/:id/follow', protectMiddleware, unfollowUser);
userRouter.get('/:username', identifyUser, getUserProfile);
userRouter.get('/:username/posts', identifyUser, getPostsByUsername);
userRouter.put(ROUTES.USERS.PROFILE, protectMiddleware, updateUserProfile);
userRouter.put(ROUTES.USERS.PROFILE_PRIVACY, protectMiddleware, updatePrivacy);
userRouter.get('/:username/followers', identifyUser, getFollowers);
userRouter.get('/:username/following', identifyUser, getFollowing);
userRouter.get(ROUTES.USERS.EXPLORE_SUGGESTIONS, protectMiddleware, getRandomUsers);



export default userRouter;