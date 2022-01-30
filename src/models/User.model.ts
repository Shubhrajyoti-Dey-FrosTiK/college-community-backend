import { Document, model, Schema, Types } from "mongoose";

/*-------- User Info --------*/

export interface User extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  followers?: Array<Types.ObjectId>;
  following?: Array<Types.ObjectId>;
  bio?: string;
  notifications?: Array<Types.ObjectId>;
  followRequests?: Array<Types.ObjectId>;
}

const schema = new Schema<User>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, required: false },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bio: { type: String, required: false },
    followRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<User>("User", schema);
