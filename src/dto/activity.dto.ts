import { Types } from "mongoose";
import { ACTIVITY_CONSTANTS } from "../constants/Activity";

export interface ActivityDto {
  type: ACTIVITY_CONSTANTS;
  activityRef: string;
  postId: Types.ObjectId | undefined;
  userId: Types.ObjectId;
  creatorId: Types.ObjectId;
  username: string;
  postRef: string | undefined;
  creatorImage?: string;
  userImage?: string;
  likesCount?: number;
  message?: string;
}
