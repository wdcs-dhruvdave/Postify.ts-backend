import { Router } from 'express';
import { protectMiddleware as auth } from '../middleware/auth.middleware';
import { saveToken, removeToken, getTokens, getTokensForUser, sendTestNotification } from '../controller/fcm.controller';

const router = Router();

/**
 * Save/Update FCM token for the authenticated user
 * POST /api/users/fcm-token
 */
router.post('/fcm-token', auth, saveToken);

/**
 * Remove FCM token from the authenticated user
 * DELETE /api/users/fcm-token
 */
router.delete('/fcm-token', auth, removeToken);

/**
 * Get all FCM tokens for the authenticated user
 * GET /api/users/fcm-tokens
 */
router.get('/fcm-tokens', auth, getTokens);

/**
 * Get FCM tokens for a specific user (for notification service)
 * GET /api/users/:userId/fcm-tokens
 */
router.get('/:userId/fcm-tokens', getTokensForUser);

/**
 * Send test notification to the authenticated user
 * POST /api/users/test-notification
 */
router.post('/test-notification', auth, sendTestNotification);

export default router;
