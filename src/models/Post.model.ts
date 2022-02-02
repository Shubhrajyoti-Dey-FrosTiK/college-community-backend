import { Document, model, Schema, Types } from "mongoose";

/*-------- Post Info --------*/

export interface Post extends Document {
  username: string;
  userId: Types.ObjectId;
  postRef: string;
  image?: Array<string>;
  title: string;
  description?: string;
  tags: Array<string>;
  people: Array<Types.ObjectId>;
  location?: string;
  active: boolean;
  likeCount: number;
}

const schema = new Schema<Post>(
  {
    username: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: [{ type: String, required: false }],
    title: { type: String, required: true },
    postRef: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    tags: [{ type: String, required: false }],
    people: [{ type: Schema.Types.ObjectId, ref: "User" }],
    location: { type: String, required: false },
    likeCount: { type: Number, required: false, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const PostModel = model<Post>("Post", schema);
