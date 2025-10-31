import { Router } from 'express';
import { User } from '../models';

const router = Router();

/**
 * Internal endpoint to get user info by ID
 * Used by notification service to fetch sender details
 * GET /api/internal/users/:userId
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'avatar_url', 'name'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      name: user.name,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Internal endpoint to get user FCM tokens
 * Used by notification service to fetch user tokens for push notifications
 * GET /api/internal/users/:userId/fcm-tokens
 */
router.get('/users/:userId/fcm-tokens', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['fcm_tokens'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      tokens: user.fcm_tokens || [],
      count: (user.fcm_tokens || []).length,
    });
  } catch (error) {
    console.error('Error fetching user FCM tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Internal endpoint for bulk FCM token cleanup
 * DELETE /api/internal/users/:userId/fcm-tokens
 */
router.delete('/users/:userId/fcm-tokens', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tokens } = req.body;

    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ error: 'Invalid tokens array' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove invalid tokens
    const currentTokens = user.fcm_tokens || [];
    const updatedTokens = currentTokens.filter(token => !tokens.includes(token));

    await user.update({ fcm_tokens: updatedTokens });

    res.status(200).json({
      message: 'Invalid tokens removed',
      removedCount: tokens.length,
      remainingCount: updatedTokens.length,
    });
  } catch (error) {
    console.error('Error cleaning up FCM tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;