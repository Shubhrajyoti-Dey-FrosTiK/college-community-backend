import { Types } from "mongoose";
import { ACTIVITY_CONSTANTS } from "../constants/Activity";

export interface ActivityDto {
  type: ACTIVITY_CONSTANTS;
  activityRef: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  postRef: string;
  creatorImage?: string;
  userImage?: string;
  likesCount?: number;
  message?: string;
}
