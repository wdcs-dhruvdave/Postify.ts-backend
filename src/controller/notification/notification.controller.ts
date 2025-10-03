import { Request, Response } from "express";

import Notification from '../../models/notification.model';
import { entryLogger, errorLogger } from '../../utils/logger';
import { HttpStatusCode, MESSAGES, CONFIG } from "../../constants/constants";

interface AuthRequest extends Request{
    user? : {id:string}
}

export const getNotifications = async (req : AuthRequest, res : Response) =>{
    const userId = req.user!.id;

    entryLogger(`getNotifications called by user ${userId}`);
    try{
        const notification = await Notification.find({recipient : userId})
        .sort({created_at : CONFIG.NOTIFICATION.SORT_ORDER as 1 | -1})
        .limit(CONFIG.NOTIFICATION.LIMIT)
        res.json(notification);
    }
    catch(error: any){
        errorLogger(error, `Failed to get notifications for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message : MESSAGES.NOTIFICATION.FETCH_ERROR});
    }

}

export const markNotificationsAsRead = async (req : AuthRequest, res:Response) => {
    const userId = req.user!.id;
    entryLogger(`markNotificationsAsRead called by user ${userId}`);
    try{
        const notification = await Notification.updateMany({recipient : userId, read : false}, {read : true});
        res.json(notification);
    }
    catch(error: any){
        errorLogger(error, `Failed to mark notifications as read for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message : MESSAGES.NOTIFICATION.MARK_AS_READ_ERROR});
    }
}