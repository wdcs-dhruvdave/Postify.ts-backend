import appEmmiter from "../event-emmiter/user-action-emmiter";
import { User,Post, Category } from "../models";
import { entryLogger,errorLogger } from "../utils/logger";
import UserActivityLog  from "../models/activity-log.model";

interface LogActivitypayload {
    userId: string;
    activityType: string;
    targetId?: string;
    targetCategoryId?: string;
}

export const initializeActivityListerner = () => {
    appEmmiter.on('log_activity', async(payload: LogActivitypayload) => {
        try{
            entryLogger(`[Activity Logger] Received 'log_activity' event with payload: ${JSON.stringify(payload)}`);

            let { userId, activityType, targetId, targetCategoryId } = payload;

            if(!targetCategoryId && (payload.activityType.startsWith('post_')) && targetId){
                const post = await Post.findByPk(targetId, { attributes: ['category_id'] });
                if(post){
                    targetCategoryId = (post as any).category_id;
                }
            }

            await UserActivityLog.create({
                userId,
                activityType,
                targetId,
                targetCategoryId
            })


        } catch (error) {
            errorLogger(error as Error, '[Activity Logger] Failed to process log_activity event');
        }
        console.log('UserActivityLog:', UserActivityLog);

        
    })
}



