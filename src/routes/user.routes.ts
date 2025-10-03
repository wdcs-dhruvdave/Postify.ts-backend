import { Router } from 'express';
import { searchUsers, followUser, unfollowUser, getFollowSuggestions, getUserProfile, getPostsByUsername, updateUserProfile, updatePrivacy, getFollowers, getFollowing, getRandomUsers } from '../controller/user/user.controller';
import { identifyUser, protectMiddleware } from '../middleware/auth.middleware';
import { emitActivityLog } from '../middleware/activity-logging-middleware';
import { ROUTES, ActivityType } from '../constants/constants';

const userRouter = Router();

userRouter.get(ROUTES.USERS.SEARCH, identifyUser, searchUsers);
userRouter.get(ROUTES.USERS.SUGGESTIONS, protectMiddleware, getFollowSuggestions);
userRouter.get(ROUTES.USERS.EXPLORE_SUGGESTIONS, protectMiddleware, getRandomUsers);

userRouter.get('/:username', identifyUser, getUserProfile);
userRouter.get('/:username/posts', identifyUser, getPostsByUsername);
userRouter.get('/:username/followers', identifyUser, getFollowers);
userRouter.get('/:username/following', identifyUser, getFollowing);

userRouter.use(protectMiddleware);
userRouter.post('/:id/follow', emitActivityLog(ActivityType.FOLLOW), followUser);
userRouter.delete('/:id/follow', unfollowUser);
userRouter.put(ROUTES.USERS.PROFILE, updateUserProfile);
userRouter.put(ROUTES.USERS.PROFILE_PRIVACY, updatePrivacy);

export default userRouter;