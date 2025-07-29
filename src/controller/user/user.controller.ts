import { Request, Response } from 'express';
import * as UserService from '../../services/user.service';
import { USER_MESSAGES } from '../../constants/user.constant';
import { entryLogger, errorLogger } from '../../utils/logger';


interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;
  const currentUserId = req.user?.id; 
  entryLogger(`Searching for user with query: "${query}"`);

  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!query) {
    return res.json([]);
  }
  
  try {
    const users = await UserService.searchUsersInDB(query, currentUserId);
    res.json(users);
  } catch (error: any) {
    errorLogger(error, 'User search failed');
    res.status(500).json({ message: 'Server error during search.' });
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
    res.status(500).json({ message: 'Server error fetching suggestions.' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id;
  entryLogger(`Fetching profile for user: ${username}`);
  try {
    const userProfile = await UserService.getUserProfileFromDB(username, currentUserId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userProfile);
  } catch (error: any) {
    errorLogger(error, `Failed to get profile for user: ${username}`);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

export const followUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = req.params.id;
  entryLogger(`User ${followerId} attempting to follow user ${followingId}`);

  if (followerId === followingId) {
    return res.status(400).json({ message: USER_MESSAGES.CANNOT_FOLLOW_SELF });
  }
  try {
    await UserService.followUserInDB(followerId, followingId);
    res.status(200).json({ message: USER_MESSAGES.FOLLOW_SUCCESS });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'You are already following this user.' });
    }

    errorLogger(error, `User ${followerId} failed to follow user ${followingId}`);
    res.status(500).json({ message: 'Server error during follow.' });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = req.params.id;
  entryLogger(`User ${followerId} attempting to unfollow user ${followingId}`);
  try {
    await UserService.unfollowUserInDB(followerId, followingId);
    res.status(200).json({ message: USER_MESSAGES.UNFOLLOW_SUCCESS });
  } catch (error: any) {
    errorLogger(error, `User ${followerId} failed to unfollow user ${followingId}`);
    res.status(500).json({ message: 'Server error during unfollow.' });
  }
};

export const getPostsByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  entryLogger(`Fetching posts for user: ${username}`);
  try {
    const posts = await UserService.getPostsByUsernameFromDB(username);
    res.json(posts);
  } catch (error: any) {
    errorLogger(error, `Failed to get posts for user: ${username}`);
    res.status(500).json({ message: 'Server error fetching user posts.' });
  }
};
