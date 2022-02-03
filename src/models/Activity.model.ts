import { model, Schema, Types, Document } from "mongoose";

/*-------- Constants --------*/
import {
  ACTIVITY_CONSTANTS,
  ACTIVITY_CONSTANTS_ARRAY,
} from "../constants/Activity";

/*-------- Activity ( Comment,Like ) --------*/

export interface Activity extends Document {
  activityRef: string;
  username: string;
  userId: Types.ObjectId;
  creatorId: Types.ObjectId;
  type: ACTIVITY_CONSTANTS;
  active: boolean;
  postId: Types.ObjectId;
  postRef: string;
  message?: string;
  creatorImage?: string;
  userImage?: string;
  likesCount?: number;
}

const schema = new Schema<Activity>(
  {
    activityRef: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    postRef: { type: String, required: true },
    message: { type: String, required: false },
    active: { type: Boolean, default: true },
    creatorImage: { type: String, required: false },
    userImage: { type: String, required: false },
    likesCount: { type: Number, required: false, default: 0 },
    type: {
      type: String,
      required: true,
      enum: ACTIVITY_CONSTANTS_ARRAY,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityModel = model<Activity>("Activity", schema);
