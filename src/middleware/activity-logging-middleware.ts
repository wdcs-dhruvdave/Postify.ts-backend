import { Response, NextFunction } from "express";
import onFinished from "on-finished";
import appEmitter from "../event-emmiter/user-action-emmiter";
import { entryLogger, errorLogger } from "../utils/logger";
import { ActivityType, CONFIG } from "../constants/constants";
import { AuthRequest } from "../types/request.types";
import { getPostCategoryById, PostCategoryData } from "../orm/post.orm";

export const emitActivityLog =
  (activityType: ActivityType) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    interface EventPayload {
      userId: string;
      activityType: ActivityType;
      targetId: string;
      targetCategoryId?: string;
    }



    onFinished(res, async (err: Error | null, res: Response) => {
      entryLogger(
        `[Activity Middleware] Request finished for ${req.method} ${req.originalUrl} with status ${res.statusCode}`
      );

      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId: string | undefined = req.user?.id;
          let targetId: string | undefined;
          let targetCategoryId: string | undefined;
          let post: PostCategoryData | null | undefined;

          switch (activityType) {
            case ActivityType.POST_LIKE:
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await getPostCategoryById(targetId);
                  if(post) {
                    targetCategoryId = post.category_id;
                  }
              }
              break;
            case ActivityType.POST_UNLIKE:
            case ActivityType.POST_DISLIKE:
            case ActivityType.POST_UNDISLIKE:
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await getPostCategoryById(targetId);
                if (post) {
                  targetCategoryId = post.category_id;
                }
              }
              break;
            case ActivityType.POST_VIEW:
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await getPostCategoryById(targetId);
                if (post) {
                  targetCategoryId = post.category_id;
                }
              }
              break;
            case ActivityType.POST_SHARE:
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await getPostCategoryById(targetId);
                if (post) {
                  targetCategoryId = post.category_id;
                }
              }
              break;
            case ActivityType.COMMENT:
              targetId = req.params.id || req.params.postId;
              targetCategoryId = req.params.categoryId;

              if (targetId) {
                post = await getPostCategoryById(targetId);
                if (post) {
                  targetCategoryId = post.category_id;
                }
              }
              break;

            case ActivityType.PROFILE_VIEW:
              targetId = req.params.id || req.params.userId;
              break;

            case ActivityType.FOLLOW:
              targetId = req.params.id;
              break;
          }

          if (userId && targetId) {
            const eventPayload: EventPayload = {
              userId,
              activityType,
              targetId,
              targetCategoryId,
            };

            entryLogger(
              `[Activity Middleware] Emitting '${
                CONFIG.EVENTS.LOG_ACTIVITY
              }' event with payload: ${JSON.stringify(eventPayload)}`
            );

            appEmitter.emit(CONFIG.EVENTS.LOG_ACTIVITY, eventPayload);

            entryLogger(
              `[Activity Middleware] Successfully emitted '${CONFIG.EVENTS.LOG_ACTIVITY}' for user ${userId}.`
            );
          }
        } catch (error) {
          errorLogger(
            error as Error,
            "[Emit Activity Middleware] Failed to gather data and emit log"
          );
        }
      }
    });

    next();
  };
