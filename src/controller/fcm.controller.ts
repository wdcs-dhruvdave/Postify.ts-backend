import { Request, Response } from 'express';
import { fcmService } from '../services/fcm.service';
import { HttpStatusCode } from '../constants/constants';

export const saveToken = async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const userId = (req as any).user.id;

    if (!fcmToken) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'FCM token is required' });
    }

    const result = await fcmService.saveUserFCMToken(userId, fcmToken);
    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(HttpStatusCode.OK).json({
      message: 'FCM token saved successfully',
      tokenCount: result.tokenCount,
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

export const removeToken = async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const userId = (req as any).user.id;

    if (!fcmToken) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'FCM token is required' });
    }

    const result = await fcmService.removeUserFCMToken(userId, fcmToken);
    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(HttpStatusCode.OK).json({
      message: 'FCM token removed successfully',
      tokenCount: result.tokenCount,
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

export const getTokens = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await fcmService.getUserFCMTokens(userId);

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(HttpStatusCode.OK).json({
      tokens: result.tokens,
      count: result.count,
    });
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

export const getTokensForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await fcmService.getUserFCMTokens(userId);

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(HttpStatusCode.OK).json({
      tokens: result.tokens,
      count: result.count,
    });
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await fcmService.sendTestNotificationToUser(userId);

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }
    
    res.status(HttpStatusCode.OK).json({
      message: 'Test notification sent',
      sent: result.sent,
      failed: result.failed,
      totalTokens: result.totalTokens,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};
