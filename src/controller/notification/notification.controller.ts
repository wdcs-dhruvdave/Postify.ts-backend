import { Request, Response } from "express";

import Notification from '../../models/notification.model';
import { entryLogger, errorLogger } from '../../utils/logger';

interface AuthRequest extends Request{
    user? : {id:string}
}

export const getNotifications = async (req : AuthRequest, res : Response) =>{
    const userId = req.user!.id;

    entryLogger(`getNotifications called by user ${userId}`);
    try{
        const notification = await Notification.find({recipient : userId})
        .sort({created_at : -1})
        .limit(20)
        res.json(notification);
    }
    catch(error: any){
        errorLogger(error, `Failed to get notifications for user ${userId}`);
        res.status(500).json({message : "Server error while fetching notifications"});
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
        res.status(500).json({message : "Server error while marking notifications as read"});
    }
}