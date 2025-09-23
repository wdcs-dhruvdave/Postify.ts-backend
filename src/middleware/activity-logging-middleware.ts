import { Response, Request, NextFunction } from "express";
import onFinished from "on-finished";
import appEmitter from "../event-emmiter/user-action-emmiter";
import { Post } from "../models";
import { entryLogger, errorLogger } from "../utils/logger";

type ActivityType =
  | "post_like"
  | "post_dislike"
  | "post_view"
  | "post_share"
  | "profile_view"
  | "follow"
  | "comment";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const emitActivityLog =
  (activityType: ActivityType) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    onFinished(res, async (err, res) => {
      entryLogger(
        `[Activity Middleware] Request finished for ${req.method} ${req.originalUrl} with status ${res.statusCode}`
      );

      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id;
          let targetId: string | undefined;
          let targetCategoryId: string | undefined;
          let post;

          switch (activityType) {
            case "post_like":
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await Post.findByPk(targetId, {
                  attributes: ["category_id"],
                });
                if (post) {
                  targetCategoryId = (post as any).category_id;
                }
              }
              break;
            case "post_dislike":
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await Post.findByPk(targetId, {
                  attributes: ["category_id"],
                });
                if (post) {
                  targetCategoryId = (post as any).category_id;
                }
              }
              break;
            case "post_view":
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await Post.findByPk(targetId, {
                  attributes: ["category_id"],
                });
                if (post) {
                  targetCategoryId = (post as any).category_id;
                }
              }
              break;
            case "post_share":
              targetId = req.params.id || req.params.postId;
              if (targetId) {
                post = await Post.findByPk(targetId, {
                  attributes: ["category_id"],
                });
                if (post) {
                  targetCategoryId = (post as any).category_id;
                }
              }
              break;
            case "comment":
              targetId = req.params.id || req.params.postId;
              targetCategoryId = req.params.categoryId;

              if (targetId) {
                post = await Post.findByPk(targetId, {
                  attributes: ["category_id"],
                });
                if (post) {
                  targetCategoryId = (post as any).category_id;
                }
              }
              break;

            case "profile_view":
              targetId = req.params.id || req.params.userId;
              break;

            case "follow":
              targetId = req.params.id;
              break;
          }
  
          if (userId && targetId) {
            const eventPayload = {
              userId,
              activityType,
              targetId,
              targetCategoryId,
            };

            entryLogger(
              `[Activity Middleware] Emitting 'log_activity' event with payload: ${JSON.stringify(
                eventPayload
              )}`
            );

            appEmitter.emit("log_activity", eventPayload);

            entryLogger(
              `[Activity Middleware] Successfully emitted 'log_activity' for user ${userId}.`
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
