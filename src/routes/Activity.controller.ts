import express from "express";
import { v4 as uuidv4 } from "uuid";

/*--------- Dto ---------*/
import { ResponseDto } from "../dto/response.dto";

/*-------- Model --------*/
import { UserModel, User } from "../models/User.model";
import { ActivityModel } from "../models/Activity.model";
import { Types } from "mongoose";

/*-------- Middleware --------*/
import { UserMiddleware } from "../middleware/User";

/*------- Dependencies -------*/
import { DatabaseService } from "../services/database/database.service";
import { EncryptionService } from "../services/encryption/encryption.service";
import { AuthenticationService } from "../services/auth/authentication.service";
import { ACTIVITY_CONSTANTS } from "../constants/Activity";

/*-------- Initialization--------*/
const router = express.Router();
const db = new DatabaseService();
const es = new EncryptionService();
const auth = new AuthenticationService();
const userMiddleware = new UserMiddleware();

/*-------- Dto --------*/

interface GetActivityByIdDto {
  headers: {
    userid: Types.ObjectId;
  };
}

interface FollowUserDto {
  headers: {
    userid: Types.ObjectId;
    username: string;
  };
  body: {
    creatorId: Types.ObjectId;
  };
}

interface CheckFollowDto {
  headers: {
    userid: Types.ObjectId;
    creatorid: Types.ObjectId;
  };
}

interface GetFollowingDto {
  headers: {
    userid: Types.ObjectId;
  };
}

/*-------- Methods --------*/

const getAllActivitiesById = async (
  request: GetActivityByIdDto
): Promise<ResponseDto> => {
  try {
    const activityList = await db.findAll(
      ActivityModel,
      {
        userId: request.headers.userid,
      },
      {},
      {},
      { updatedAt: -1 },
      ["postId", "creatorId", "userId"]
    );
    return { message: "Activity Retrieved successfully", data: activityList };
  } catch (error: any) {
    return { error };
  }
};

const getAllNotificationsById = async (
  request: GetActivityByIdDto
): Promise<ResponseDto> => {
  try {
    const activityList = await db.findAll(
      ActivityModel,
      {
        $and: [
          { creatorId: request.headers.userid },
          { userId: { $ne: request.headers.userid } },
          {
            type: {
              $in: [
                ACTIVITY_CONSTANTS.FOLLOW_USER,
                ACTIVITY_CONSTANTS.LIKE_POST,
                ACTIVITY_CONSTANTS.COMMENT_POST,
              ],
            },
          },
        ],
      },
      {},
      {},
      { updatedAt: -1 },
      ["postId", "userId"]
    );
    return { message: "Activity Retrieved successfully", data: activityList };
  } catch (error: any) {
    return { error };
  }
};

const getFollowing = async (request: GetFollowingDto): Promise<ResponseDto> => {
  try {
    const following = await db.findAll(
      ActivityModel,
      {
        userId: request.headers.userid,
        type: ACTIVITY_CONSTANTS.FOLLOW_USER,
        active: true,
      },
      {},
      {},
      {},
      ["userId", "creatorId"]
    );
    return { message: "Following retrieved successfully", data: following };
  } catch (error: any) {
    return { error };
  }
};

const followUser = async (request: FollowUserDto): Promise<ResponseDto> => {
  try {
    const activityRef = uuidv4();
    const activity = await db.create(ActivityModel, {
      activityRef,
      creatorId: request.body.creatorId,
      userId: request.headers.userid,
      username: request.headers.username,
      type: ACTIVITY_CONSTANTS.FOLLOW_USER,
      active: true,
    });
    return { message: "User Followed", data: activity };
  } catch (error: any) {
    return { error };
  }
};

const checkFollow = async (request: CheckFollowDto): Promise<ResponseDto> => {
  try {
    const follow = await db.count(ActivityModel, {
      userId: request.headers.userid,
      creatorId: request.headers.creatorid,
      type: ACTIVITY_CONSTANTS.FOLLOW_USER,
      active: true,
    });
    return {
      message: "Check follow",
      data: { follow: follow > 0 ? true : false },
    };
  } catch (error: any) {
    return { error };
  }
};

const unfollowUser = async (request: FollowUserDto): Promise<ResponseDto> => {
  try {
    console.log(request.headers, request.body);

    const activityRef = uuidv4();
    const activity = await db.findOneAndUpdate(
      ActivityModel,
      {
        userId: request.headers.userid,
        creatorId: request.body.creatorId,
        type: ACTIVITY_CONSTANTS.FOLLOW_USER,
        active: true,
      },
      {
        $set: { active: false },
      },
      { new: true }
    );
    console.log(activity);

    if (activity) {
      await db.create(ActivityModel, {
        activityRef,
        creatorId: request.body.creatorId,
        userId: request.headers.userid,
        username: request.headers.username,
        type: ACTIVITY_CONSTANTS.UNFOLLOW_USER,
        active: true,
      });
    }
    return { message: "User Unfollowed", data: activity };
  } catch (error: any) {
    return { error };
  }
};

/*-------- Routes --------*/

router.get(
  "/",
  [userMiddleware.loginStatus],
  async (request: GetActivityByIdDto, response: any) => {
    const activityList: ResponseDto = await getAllActivitiesById(request);
    response.send(activityList);
  }
);

router.get(
  "/follow",
  [userMiddleware.loginStatus],
  async (request: CheckFollowDto, response: any) => {
    const follow: ResponseDto = await checkFollow(request);
    response.send(follow);
  }
);

router.get(
  "/following",
  [userMiddleware.loginStatus],
  async (request: GetFollowingDto, response: any) => {
    const follow: ResponseDto = await getFollowing(request);
    response.send(follow);
  }
);

router.get(
  "/notifications",
  [userMiddleware.loginStatus],
  async (request: GetActivityByIdDto, response: any) => {
    const activityList: ResponseDto = await getAllNotificationsById(request);
    response.send(activityList);
  }
);

router.post(
  "/follow",
  [userMiddleware.loginStatus],
  async (request: FollowUserDto, response: any) => {
    const activityList: ResponseDto = await followUser(request);
    response.send(activityList);
  }
);

router.post(
  "/unfollow",
  [userMiddleware.loginStatus],
  async (request: FollowUserDto, response: any) => {
    const activityList: ResponseDto = await unfollowUser(request);
    response.send(activityList);
  }
);

export default router;
