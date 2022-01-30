import { ActivityDto } from "../../dto/activity.dto";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

/*--------- Models ---------*/
import { ActivityModel, Activity } from "../../models/Activity.model";
import { PostModel, Post } from "../../models/Post.model";
import { UserModel } from "../../models/User.model";

/*-------- Dependencies --------*/
import { DatabaseService } from "../database/database.service";

export class ActivityNotifierService {
  db = new DatabaseService();

  async createActivity(activity: ActivityDto): Promise<Activity | null> {
    try {
      const newActivity = await this.db.create(ActivityModel, activity, {
        new: true,
      });
      return newActivity;
    } catch (error: any) {
      return null;
    }
  }

  async createNotifications(
    creatorId: Types.ObjectId,
    activityId: Types.ObjectId
  ) {
    try {
      await this.db.findOneAndUpdate(
        UserModel,
        { _id: creatorId },
        { $push: { notifications: activityId } }
      );
    } catch (error: any) {
      return;
    }
  }

  async trigger(
    activity: ActivityDto,
    creatorId: Types.ObjectId,
    notify: boolean = true
  ): Promise<Activity | null> {
    try {
      const newActivity = await this.createActivity(activity);
      if (notify && creatorId != activity.userId && newActivity) {
        console.log("notify");
        await this.createNotifications(creatorId, newActivity._id);
      }
      return newActivity;
    } catch (error: any) {
      return null;
    }
  }
}
