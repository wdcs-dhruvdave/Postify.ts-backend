import * as admin from 'firebase-admin';
import User from '../models/user.model';
import { CONFIG, HttpStatusCode } from '../constants/constants';

// Track initialization state to prevent re-initialization
let firebaseInitialized = false;
let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK with error handling
 * Returns null if initialization fails to allow graceful degradation
 */
const initializeFirebaseAdmin = (): admin.app.App | null => {
  if (firebaseInitialized) {
    return firebaseApp;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // Check for required environment variables
    if (!serviceAccountKey) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set. FCM functionality will be disabled.');
      firebaseInitialized = true;
      return null;
    }

    if (!projectId) {
      console.warn('⚠️ FIREBASE_PROJECT_ID not set. FCM functionality will be disabled.');
      firebaseInitialized = true;
      return null;
    }

    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0] as admin.app.App;
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK already initialized');
      return firebaseApp;
    }

    // Parse service account and initialize
    const serviceAccount = JSON.parse(serviceAccountKey) as admin.ServiceAccount;
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error: unknown) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.warn('⚠️ FCM functionality will be disabled due to initialization error.');
    firebaseInitialized = true;
    firebaseApp = null;
    return null;
  }
};

// Type definitions for FCM operations
export interface FCMNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface FCMTarget {
  token?: string;
  tokens?: string[];
  topic?: string;
  condition?: string;
}

export interface FCMSendResult {
  success: number;
  failure: number;
  invalidTokens: string[];
}

/**
 * Firebase Cloud Messaging Service
 * Handles all FCM operations with graceful degradation when Firebase is unavailable
 */
export class FCMService {
  private messaging: admin.messaging.Messaging | null;
  private isAvailable: boolean;

  constructor() {
    console.log('🔥 Initializing FCMService...');
    const adminApp = initializeFirebaseAdmin();
    this.messaging = adminApp ? adminApp.messaging() : null;
    this.isAvailable = this.messaging !== null;
    
    if (!this.isAvailable) {
      console.warn('⚠️ FCMService initialized but Firebase is not available. All operations will return safe defaults.');
    } else {
      console.log('✅ FCMService ready with Firebase integration');
    }
  }

  /**
   * Check if FCM service is available
   */
  public isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Validate FCM token using dry-run approach
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot validate token. Returning true as fallback.');
      return true; // Return true to not block user registration
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: CONFIG.FCM.DEFAULTS.TEST_TITLE,
          body: CONFIG.FCM.DEFAULTS.TEST_BODY
        },
        data: { test: 'true', timestamp: Date.now().toString() }
      };

      // Use sendEach with dry-run flag - correct Firebase Admin SDK approach
      const response = await this.messaging.sendEach([message], true);
      
      if (response.responses.length > 0 && response.responses[0].success) {
        console.log('✅ FCM token validation successful');
        return true;
      }
      
      // Check for specific invalid token errors
      const error = response.responses[0]?.error;
      if (error && (
        error.code === CONFIG.FCM.ERROR_CODES.INVALID_REGISTRATION_TOKEN || 
        error.code === CONFIG.FCM.ERROR_CODES.REGISTRATION_TOKEN_NOT_REGISTERED
      )) {
        console.error('❌ Invalid FCM token:', error.message);
        return false;
      }
      
      // Token might be valid but dry run had other issues
      console.log('⚠️ FCM token validation inconclusive, assuming valid');
      return true;
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error validating FCM token:', fcmError.message);
      return false;
    }
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(
    token: string,
    payload: FCMNotificationPayload
  ): Promise<boolean> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot send notification to device.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: CONFIG.FCM.WEBPUSH.ICON,
            badge: CONFIG.FCM.WEBPUSH.BADGE,
            requireInteraction: CONFIG.FCM.WEBPUSH.REQUIRE_INTERACTION,
            actions: [
              { action: 'view', title: 'View' },
              { action: 'dismiss', title: 'Dismiss' }
            ]
          },
          fcmOptions: {
            link: payload.data?.url || CONFIG.FCM.DEFAULTS.FALLBACK_URL
          }
        },
      };

      const response = await this.messaging.send(message);
      console.log('✅ Successfully sent FCM message:', response);
      return true;
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error sending FCM message:', fcmError.message);
      console.error('❌ Error code:', fcmError.code);
      return false;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToDevices(
    tokens: string[],
    payload: FCMNotificationPayload
  ): Promise<FCMSendResult> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot send notifications to devices.');
      return { success: 0, failure: tokens.length, invalidTokens: [] };
    }

    if (tokens.length === 0) {
      console.warn('⚠️ No tokens provided for FCM multicast');
      return { success: 0, failure: 0, invalidTokens: [] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: CONFIG.FCM.WEBPUSH.ICON,
            badge: CONFIG.FCM.WEBPUSH.BADGE,
            requireInteraction: CONFIG.FCM.WEBPUSH.REQUIRE_INTERACTION,
          },
          fcmOptions: {
            link: payload.data?.url || CONFIG.FCM.DEFAULTS.FALLBACK_URL
          }
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log(`📱 FCM Multicast Results: ${response.successCount} success, ${response.failureCount} failed`);
      
      // Track invalid tokens for cleanup
      const invalidTokens: string[] = [];
      
      // Log individual failures for debugging
      if (response.failureCount > 0) {
        response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
          if (!resp.success && resp.error) {
            console.error(`❌ FCM Error for token ${tokens[idx].substring(0, 20)}...:`, resp.error.code, resp.error.message);
            
            // Track tokens that need cleanup
            if (resp.error.code === CONFIG.FCM.ERROR_CODES.INVALID_REGISTRATION_TOKEN || 
                resp.error.code === CONFIG.FCM.ERROR_CODES.REGISTRATION_TOKEN_NOT_REGISTERED) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
      }
      
      return {
        success: response.successCount,
        failure: response.failureCount,
        invalidTokens,
      };
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error sending FCM messages to multiple devices:', fcmError.message);
      console.error('❌ Error code:', fcmError.code);
      return { success: 0, failure: tokens.length, invalidTokens: [] };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    payload: FCMNotificationPayload
  ): Promise<boolean> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot send notification to topic.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: CONFIG.FCM.WEBPUSH.ICON,
            badge: CONFIG.FCM.WEBPUSH.BADGE,
            requireInteraction: CONFIG.FCM.WEBPUSH.REQUIRE_INTERACTION,
          },
          fcmOptions: {
            link: payload.data?.url || CONFIG.FCM.DEFAULTS.FALLBACK_URL
          }
        },
      };

      const response = await this.messaging.send(message);
      console.log('✅ Successfully sent FCM topic message:', response);
      return true;
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error sending FCM topic message:', fcmError.message);
      console.error('❌ Error code:', fcmError.code);
      return false;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string | string[], topic: string): Promise<boolean> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot subscribe to topic.');
      return false;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await this.messaging.subscribeToTopic(tokenArray, topic);
      console.log('✅ Successfully subscribed to topic:', topic, `${response.successCount}/${tokenArray.length} tokens`);
      return response.successCount > 0;
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error subscribing to topic:', fcmError.message);
      return false;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<boolean> {
    if (!this.isAvailable || !this.messaging) {
      console.warn('❌ FCM service not available. Cannot unsubscribe from topic.');
      return false;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await this.messaging.unsubscribeFromTopic(tokenArray, topic);
      console.log('✅ Successfully unsubscribed from topic:', topic, `${response.successCount}/${tokenArray.length} tokens`);
      return response.successCount > 0;
    } catch (error: unknown) {
      const fcmError = error as admin.FirebaseError;
      console.error('❌ Error unsubscribing from topic:', fcmError.message);
      return false;
    }
  }

  async saveUserFCMToken(userId: string, fcmToken: string) {
    const isValid = await this.validateToken(fcmToken);
    if (!isValid) {
      return { success: false, error: 'Invalid FCM token', statusCode: HttpStatusCode.BAD_REQUEST };
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: 'User not found', statusCode: HttpStatusCode.NOT_FOUND };
    }

    const currentTokens = user.fcm_tokens || [];
    const updatedTokens = Array.from(new Set([...currentTokens, fcmToken]));

    await user.update({ fcm_tokens: updatedTokens });

    return { success: true, tokenCount: updatedTokens.length };
  }

  async removeUserFCMToken(userId: string, fcmToken: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: 'User not found', statusCode: HttpStatusCode.NOT_FOUND };
    }

    const currentTokens = user.fcm_tokens || [];
    const updatedTokens = currentTokens.filter(token => token !== fcmToken);

    await user.update({ fcm_tokens: updatedTokens });

    return { success: true, tokenCount: updatedTokens.length };
  }

  async getUserFCMTokens(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['fcm_tokens'],
    });

    if (!user) {
      return { success: false, error: 'User not found', statusCode: HttpStatusCode.NOT_FOUND };
    }

    const tokens = user.fcm_tokens || [];
    return { success: true, tokens, count: tokens.length };
  }

  async sendTestNotificationToUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: 'User not found', statusCode: HttpStatusCode.NOT_FOUND };
    }

    const fcmTokens = user.fcm_tokens || [];
    if (fcmTokens.length === 0) {
      return { success: false, error: 'No FCM tokens found for user', statusCode: HttpStatusCode.BAD_REQUEST };
    }

    const payload = {
      title: 'Test Notification',
      body: `Hello ${user.username || user.name}! Your notifications are working correctly.`,
      data: {
        type: 'test',
        url: '/feed',
      },
    };

    const result = await this.sendToDevices(fcmTokens, payload);

    return {
      success: true,
      sent: result.success,
      failed: result.failure,
      totalTokens: fcmTokens.length,
    };
  }
}

// Create and export singleton instance
console.log('📦 Creating FCMService singleton instance...');
export const fcmService = new FCMService();
console.log('✅ FCM service module loaded successfully');