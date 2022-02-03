import express from "express";

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

/*-------- Methods --------*/

const getAllActivitiesById = async (
  request: GetActivityByIdDto
): Promise<ResponseDto> => {
  try {
    const activityList = await db.findAll(
      ActivityModel,
      {
        userid: request.headers.userid,
      },
      {},
      {},
      { updatedAt: -1 },
      ["postId"]
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
  "/notifications",
  [userMiddleware.loginStatus],
  async (request: GetActivityByIdDto, response: any) => {
    const activityList: ResponseDto = await getAllNotificationsById(request);
    response.send(activityList);
  }
);

export default router;
