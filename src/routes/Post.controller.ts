import express, { Request } from "express";
import { Mongoose, Schema, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/*--------- Dto ---------*/
import { ResponseDto } from "../dto/response.dto";

/*-------- Model --------*/
import { UserModel, User } from "../models/User.model";
import { PostModel, Post } from "../models/Post.model";
import { ActivityModel, Activity } from "../models/Activity.model";

/*-------- Middleware --------*/
import { UserMiddleware } from "../middleware/User";

/*------- Dependencies -------*/
import { DatabaseService } from "../services/database/database.service";
import { ActivityNotifierService } from "../services/notifications/activityNotifier.service";

/*-------- Constants --------*/
import { ACTIVITY_CONSTANTS } from "../constants/Activity";

/*-------- Initialization--------*/
const router = express.Router();
const db = new DatabaseService();
const userMiddleware = new UserMiddleware();
const ans = new ActivityNotifierService();

/*-------- Dto --------*/

interface GetPostDto {
  headers: {
    userid: Types.ObjectId;
    username?: string;
    pageNumber?: number;
    pageSize?: number;
    limit?: number;
  };
}

interface GetPostByIdDto {
  headers: {
    postid: Types.ObjectId;
    userid: Types.ObjectId;
    pagenumber?: number;
    pagesize?: number;
    limit?: number;
  };
}

interface CheckIfLikedDto {
  headers: {
    postid: Types.ObjectId;
    userid: Types.ObjectId;
  };
}

interface CreatePostDto {
  body: {
    image?: Array<string>;
    title: string;
    description?: string;
    tags?: Array<string>;
    likeCount: number;
    people?: Array<Types.ObjectId>;
    location?: string;
  };
  headers: {
    username: string;
    userid: Types.ObjectId;
  };
}

interface UpdatePostDto {
  body: {
    postId: Types.ObjectId;
    update: {
      image?: Array<string>;
      title?: string;
      description?: string;
      tags?: Array<string>;
      location: string;
    };
  };
  headers: {
    username: string;
  };
}

interface CreateCommentDto {
  body: {
    message: string;
    postId: Types.ObjectId;
    postRef: Types.ObjectId;
    creatorImage?: string;
    userImage?: string;
  };
  headers: {
    username: string;
    userid: Types.ObjectId;
  };
}

interface LikeDto {
  body: {
    message?: string;
    postRef: string;
    creatorImage?: string;
    userImage?: string;
    likesCount?: number;
  };
  headers: {
    username: string;
    userid: Types.ObjectId;
    postid: Types.ObjectId;
    activityid?: Types.ObjectId;
  };
}

interface UpdateActivityDto {
  body: {
    message: string;
  };
  headers: {
    username: string;
    activityid: Types.ObjectId;
    userid: Types.ObjectId;
  };
}

/*-------- Methods --------*/

// const getPost = async (request: GetPostDto): Promise<ResponseDto> => {
//   try {
//     const username: string | undefined = request.headers.username;
//     let following: Array<any> = [];
//     if (username) {
//       const user: any = await db.findOne(UserModel, { username }, {});
//       if (user.following.length > 0) {
//         user.following.map((data: User) => {
//           following.push(data.username);
//         });
//       }
//     }
//     var searchOptions =
//       following.length > 0 ? { username: { $in: following } } : {};
//     const posts = db.findAll(
//       PostModel,
//       searchOptions,
//       {},
//       {},
//       { updatedAt: -1 },
//       [],
//       request.headers.pageNumber ? request.headers.pageNumber : 1,
//       request.headers.pageSize ? request.headers.pageSize : 10,
//       request.headers.limit ? request.headers.limit : 10
//     );
//     return { message: "Posts fetched", data: posts };
//   } catch (error: any) {
//     return { error: error.message };
//   }
// };

const getPostById = async (request: GetPostByIdDto): Promise<ResponseDto> => {
  try {
    const post = await db.findOne(
      PostModel,
      { _id: request.headers.postid },
      {},
      ["userId"]
    );

    return { message: "Post fetched", data: post };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getPostsByUser = async (request: GetPostDto): Promise<ResponseDto> => {
  try {
    const post = await db.findAll(
      PostModel,
      {
        userId: request.headers.userid,
      },
      {},
      {},
      { updatedAt: -1 },
      ["userId"],
      request.headers.pageNumber ? request.headers.pageNumber : 1,
      request.headers.pageSize ? request.headers.pageSize : 10,
      request.headers.limit ? request.headers.limit : 10
    );
    return { message: "Post fetched", data: post };
  } catch (error: any) {
    return { error: error.message };
  }
};

const checkIfLiked = async (request: CheckIfLikedDto): Promise<ResponseDto> => {
  try {
    const check = await db.findOne(ActivityModel, {
      userId: request.headers.userid,
      postId: request.headers.postid,
      type: ACTIVITY_CONSTANTS.LIKE_POST,
      active: true,
    });
    return { message: "Checked", data: check };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getAllPosts = async (request: GetPostDto): Promise<ResponseDto> => {
  try {
    const posts = await db.findAll(
      PostModel,
      {},
      {},
      {},
      { updatedAt: -1 },
      ["userId"],
      request.headers.pageNumber ? request.headers.pageNumber : 1,
      request.headers.pageSize ? request.headers.pageSize : 10,
      request.headers.limit ? request.headers.limit : 10
    );
    return { message: "Posts fetched", data: posts };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getAllComments = async (
  request: GetPostByIdDto
): Promise<ResponseDto> => {
  try {
    const post = await db.findAll(
      ActivityModel,
      {
        postId: request.headers.postid,
        type: ACTIVITY_CONSTANTS.COMMENT_POST,
        active: true,
      },
      {},
      {},
      { updatedAt: -1 },
      ["userId"],
      request.headers.pagenumber ? request.headers.pagenumber : 1,
      request.headers.pagesize ? request.headers.pagesize : 10,
      request.headers.limit ? request.headers.limit : 10
    );
    return { message: "Comments Fetched", data: post };
  } catch (error: any) {
    return { error: error.message };
  }
};

const createPost = async (request: CreatePostDto): Promise<ResponseDto> => {
  try {
    const postRef = uuidv4();
    const postObj = {
      username: request.headers.username,
      userId: request.headers.userid,
      image: request.body.image,
      title: request.body.title,
      postRef: postRef,
      description: request.body.description || "",
      tags: request.body.tags || [],
      likeCount: request.body.likeCount || 0,
      people: request.body.people || [],
      location: request.body.location || "",
      active: true,
    };
    const post = await db.create(PostModel, postObj, { new: true });
    const activityRef = uuidv4();
    await db.create(ActivityModel, {
      activityRef,
      userId: request.headers.userid,
      username: request.headers.username,
      postId: post._id,
      postRef: postRef,
      creatorId: postObj.userId,
      type: ACTIVITY_CONSTANTS.CREATE_POST,
      createImage: request.body.image
        ? request.body.image.length > 0
          ? request.body.image
          : ""
        : "",
      active: true,
    });
    return { message: "Post Created", data: post };
  } catch (error: any) {
    return { error: error.message };
  }
};

const updatePost = async (request: UpdatePostDto): Promise<ResponseDto> => {
  try {
    const updatedPost = await db.findOneAndUpdate(
      PostModel,
      { _id: request.body.postId },
      request.body.update,
      { new: true }
    );
    return { message: "Post Updated", data: updatedPost };
  } catch (error: any) {
    return { error: error.message };
  }
};

const createComment = async (
  request: CreateCommentDto
): Promise<ResponseDto> => {
  try {
    const post: Post = await db.findOne(PostModel, {
      _id: request.body.postId,
    });
    if (post) {
      const activityRef = uuidv4();
      const activity: Activity | null = await ans.trigger(
        {
          activityRef,
          creatorId: post.userId,
          type: ACTIVITY_CONSTANTS.COMMENT_POST,
          message: request.body.message,
          postId: post._id,
          postRef: post.postRef,
          username: request.headers.username,
          userId: request.headers.userid,
        },
        post._id
      );
      if (activity) {
        return { message: "Commented Successfully", data: activity };
      } else {
        return { message: "Commented Failed" };
      }
    } else {
      return { message: "Post does not exist" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

const getLike = async (request: LikeDto): Promise<ResponseDto> => {
  try {
    const like = await db.findAll(
      ActivityModel,
      {
        postId: request.headers.postid,
        active: true,
        type: ACTIVITY_CONSTANTS.LIKE_POST,
      },
      {},
      { new: true },
      { updatedAt: -1 }
    );
    return { message: "Liked people retrive successfull", data: like };
  } catch (error: any) {
    return { error: error.message };
  }
};

const addLike = async (request: LikeDto): Promise<ResponseDto> => {
  try {
    const post: Post = await db.findOneAndUpdate(
      PostModel,
      { _id: request.headers.postid },
      {
        $inc: { likeCount: 1 },
      },
      { new: true }
    );
    if (post) {
      const activityRef = uuidv4();
      const activity = await ans.trigger(
        {
          activityRef,
          creatorId: post.userId,
          postId: post._id,
          postRef: post.postRef,
          username: request.headers.username,
          userImage: request.body.userImage || "",
          creatorImage: post.image ? post.image[0] : "",
          userId: request.headers.userid,
          type: ACTIVITY_CONSTANTS.LIKE_POST,
        },
        post.userId
      );
      if (activity) {
        return { message: "Liked Successfully", data: activity };
      } else {
        return { message: "Liked Failed" };
      }
    } else {
      return { message: "Post does not exist" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

const updateComment = async (
  request: UpdateActivityDto
): Promise<ResponseDto> => {
  try {
    const updatedActivity = await db.findOneAndUpdate(
      ActivityModel,
      {
        activityId: request.headers.activityid,
        username: request.headers.username,
      },
      {
        $set: {
          message: request.body.message,
        },
      },
      { new: true }
    );
    return { message: "Comment updated successfully", data: updatedActivity };
  } catch (error: any) {
    return { error: error.message };
  }
};

const deleteComment = async (
  request: UpdateActivityDto
): Promise<ResponseDto> => {
  try {
    const updatedActivity: any = await db.findOneAndUpdate(
      ActivityModel,
      {
        _id: request.headers.activityid,
      },
      { $set: { active: false } },
      { new: true },
      ["postId"]
    );

    if (updatedActivity) {
      const activity: Activity | null = await ans.trigger(
        {
          creatorId: updatedActivity.postId.userId,
          activityRef: updatedActivity.activityRef,
          type: ACTIVITY_CONSTANTS.REMOVE_COMMENT_POST,
          message: request.body.message,
          postId: updatedActivity.postId._id,
          postRef: updatedActivity.postId.postRef,
          username: request.headers.username,
          userId: request.headers.userid,
        },
        updatedActivity.postId.userId,
        false
      );
      if (activity) {
        return { message: "Comment Deleted Successfully", data: activity };
      } else {
        return { message: "Comment deletion Failed" };
      }
    } else {
      return { message: "Post does not exist" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

const deleteLike = async (request: LikeDto): Promise<ResponseDto> => {
  try {
    const updatedActivity: Activity = await db.findOneAndUpdate(
      ActivityModel,
      {
        _id: request.headers.activityid,
      },
      { $set: { active: false } },
      { new: true }
    );

    const post: Post = await db.findOneAndUpdate(
      PostModel,
      { _id: updatedActivity.postId },
      { $inc: { likeCount: -1 } },
      { new: true }
    );

    if (updatedActivity) {
      const activity: Activity | null = await ans.trigger(
        {
          activityRef: updatedActivity.activityRef,
          type: ACTIVITY_CONSTANTS.REMOVE_LIKE_POST,
          message: request.body.message,
          postId: updatedActivity.postId
            ? updatedActivity.postId._id
            : new Types.ObjectId("dummyPostId"),
          postRef: post.postRef,
          username: request.headers.username,
          userId: request.headers.userid,
          creatorId: post.userId,
        },
        post.userId,
        false
      );
      if (activity) {
        return { message: "Like removed Successfully", data: activity };
      } else {
        return { message: "Like remove Failed" };
      }
    } else {
      return { message: "Post does not exist" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

/*-------- Routes --------*/

router.get(
  "/",
  [userMiddleware.loginStatus],
  async (request: GetPostDto, response: any) => {
    const user: ResponseDto = await getAllPosts(request);
    response.send(user);
  }
);

router.get(
  "/id",
  [userMiddleware.loginStatus],
  async (request: GetPostByIdDto, response: any) => {
    const user: ResponseDto = await getPostById(request);
    response.send(user);
  }
);

router.get(
  "/user",
  [userMiddleware.loginStatus],
  async (request: GetPostDto, response: any) => {
    const user: ResponseDto = await getPostsByUser(request);
    response.send(user);
  }
);

router.get(
  "/checkLike",
  [userMiddleware.loginStatus],
  async (request: CheckIfLikedDto, response: any) => {
    const user: ResponseDto = await checkIfLiked(request);
    response.send(user);
  }
);

router.get(
  "/comment",
  [userMiddleware.loginStatus],
  async (request: GetPostByIdDto, response: any) => {
    const comments: ResponseDto = await getAllComments(request);
    response.send(comments);
  }
);

router.post(
  "/",
  [userMiddleware.loginStatus],
  async (request: CreatePostDto, response: any) => {
    const newPost: ResponseDto = await createPost(request);
    response.send(newPost);
  }
);

router.post(
  "/comment/",
  [userMiddleware.loginStatus],
  async (request: CreateCommentDto, response: any) => {
    const newComment: ResponseDto = await createComment(request);
    response.send(newComment);
  }
);

router.get(
  "/like/",
  [userMiddleware.loginStatus],
  async (request: LikeDto, response: any) => {
    const like: ResponseDto = await getLike(request);
    response.send(like);
  }
);

router.post(
  "/like/",
  [userMiddleware.loginStatus],
  async (request: LikeDto, response: any) => {
    const like: ResponseDto = await addLike(request);
    response.send(like);
  }
);

router.put(
  "/",
  [userMiddleware.loginStatus],
  async (request: UpdatePostDto, response: any) => {
    const newPost: ResponseDto = await updatePost(request);
    response.send(newPost);
  }
);

router.put(
  "/comment/",
  [userMiddleware.loginStatus],
  async (request: UpdateActivityDto, response: any) => {
    const updatedComment: ResponseDto = await updateComment(request);
    response.send(updatedComment);
  }
);

router.delete(
  "/comment/",
  [userMiddleware.loginStatus],
  async (request: UpdateActivityDto, response: any) => {
    const comment: ResponseDto = await deleteComment(request);
    response.send(comment);
  }
);

router.delete(
  "/like/",
  [userMiddleware.loginStatus],
  async (request: LikeDto, response: any) => {
    const like: ResponseDto = await deleteLike(request);
    response.send(like);
  }
);

export default router;
