import { Request, Response } from 'express';
import * as UserService from '../../services/user.service';
import { entryLogger, errorLogger } from '../../utils/logger';
import * as PostService from "../../services/post.service";
import { UniqueConstraintError } from 'sequelize';
import { HttpStatusCode, MESSAGES, CONFIG } from '../../constants/constants';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;
  const currentUserId = req.user?.id; 
  entryLogger(`Searching for user with query: "${query}"`);

  if (!currentUserId) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
  }

  if (!query) {
    return res.json([]);
  }
  
  try {
    const users = await UserService.searchUsersInDB(query, currentUserId);
    res.json(users);
  } catch (error: any) {
    errorLogger(error, 'User search failed');
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getFollowSuggestions = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  entryLogger(`Fetching follow suggestions for user: ${userId}`);
  try {
    const suggestions = await UserService.getFollowSuggestionsFromDB(userId);
    res.json(suggestions);
  } catch (error: any) {
    errorLogger(error, `Failed to get follow suggestions for user: ${userId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id;
  entryLogger(`Fetching profile for user: ${username}`);
  try {
    const userProfile = await UserService.getUserProfileFromDB(username, currentUserId);
    if (!userProfile) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.USER.NOT_FOUND });
    }
    res.json(userProfile);
  } catch (error: any) {
    errorLogger(error, `Failed to get profile for user: ${username}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const followUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = req.params.id;
  entryLogger(`User ${followerId} attempting to follow user ${followingId}`);

  if (followerId === followingId) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.USER.CANNOT_FOLLOW_SELF });
  }
  try {
    await UserService.followUserInDB(followerId, followingId);
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.USER.FOLLOW_SUCCESS });
  } catch (error: any) {
    if (error instanceof UniqueConstraintError) {
      return res.status(HttpStatusCode.CONFLICT).json({ message: MESSAGES.USER.ALREADY_FOLLOWING });
    }
    errorLogger(error, `User ${followerId} failed to follow user ${followingId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = req.params.id;
  entryLogger(`User ${followerId} attempting to unfollow user ${followingId}`);
  try {
    await UserService.unfollowUserInDB(followerId, followingId);
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.USER.UNFOLLOW_SUCCESS });
  } catch (error: any) {
    errorLogger(error, `User ${followerId} failed to unfollow user ${followingId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getPostsByUsername = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id; 
  
  entryLogger(`Fetching posts for user: ${username}`);
  try {
    const posts = await PostService.getPostsByUsernameFromDB(username, currentUserId);
    res.json(posts);
  } catch (error: any) {
    errorLogger(error, `Failed to get posts for user: ${username}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  entryLogger(`User ${userId} attempting to update profile.`);
  try {
    const updatedUser = await UserService.updateUserProfileInDB(userId, req.body);
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.USER.PROFILE_UPDATED_SUCCESS, user: updatedUser });
  } catch (error: any) {
    errorLogger(error, `Failed to update profile for user ${userId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const updatePrivacy = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { is_private } = req.body;

  if (typeof is_private !== 'boolean') {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.USER.INVALID_PRIVACY_VALUE });
  }
  try {
    const updatedUser = await UserService.updatePrivacyInDB(userId, is_private);
    res.status(HttpStatusCode.OK).json({ 
        message: MESSAGES.USER.PRIVACY_UPDATED_SUCCESS,
        user: updatedUser 
    });
  } catch (error: any) {
    errorLogger(error, `Failed to update privacy for user: ${userId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id;
  entryLogger(`Fetching followers for user: ${username}`);
  try {
    const followers = await UserService.getFollowersFromDB(username, currentUserId);
    res.json(followers);
  } catch (error: any) {
    errorLogger(error, `Failed to get followers for user: ${username}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id;
  entryLogger(`Fetching following list for user: ${username}`);
  try {
    const following = await UserService.getFollowingFromDB(username, currentUserId);
    res.json(following);
  } catch (error: any) {
    errorLogger(error, `Failed to get following list for user: ${username}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const getRandomUsers = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  entryLogger(`Fetching random user suggestions for user: ${userId}`);
  try {
    const users = await UserService.getFollowSuggestionsFromDB(userId, CONFIG.PAGINATION.SEARCH_LIMIT); 
    res.json(users);
  } catch (error: any) {
    errorLogger(error, `Failed to get random users for user: ${userId}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};
