import express from "express";

/*--------- Dto ---------*/
import { ResponseDto } from "../dto/response.dto";

/*-------- Model --------*/
import { UserModel, User } from "../models/User.model";

/*-------- Middleware --------*/
import { UserMiddleware } from "../middleware/User";

/*------- Dependencies -------*/
import { DatabaseService } from "../services/database/database.service";
import { EncryptionService } from "../services/encryption/encryption.service";
import { AuthenticationService } from "../services/auth/authentication.service";

/*-------- Initialization--------*/
const router = express.Router();
const db = new DatabaseService();
const es = new EncryptionService();
const auth = new AuthenticationService();
const userMiddleware = new UserMiddleware();

/*-------- Dto --------*/

interface GetUserDto {
  headers: {
    username: string;
  };
}

interface CreateUserDto {
  body: {
    name: string;
    username: string;
    email: string;
    password: string;
    activity?: string;
    image?: Array<string>;
    followers?: string;
    following?: string;
    expiresIn?: string | number;
    bio?: string;
  };
}

interface LoginDto {
  body: {
    username: string;
    password: string;
    expiresIn?: string | number;
  };
}

interface SearchUserDto {
  headers: {
    search: string;
  };
}

/*-------- Methods --------*/

const getUser = async (request: GetUserDto): Promise<ResponseDto> => {
  try {
    const user: User = await db.findOne(
      UserModel,
      { username: request.headers.username },
      { password: 0 }
    );
    return { data: user };
  } catch (error: any) {
    return { error: error.message };
  }
};

const createUser = async (request: CreateUserDto): Promise<ResponseDto> => {
  try {
    const email: Number = await db.count(UserModel, {
      email: request.body.email,
    });
    if (email) {
      return { message: "Email already exists" };
    }
    const username: Number = await db.count(UserModel, {
      username: request.body.username,
    });
    if (username) {
      return { message: "Username already exists" };
    }
    const userObject = {
      name: request.body.name,
      username: request.body.username,
      email: request.body.email,
      password: await es.hash(request.body.password),
      followers: [],
      following: [],
      notifications: [],
      post: [],
      bio: request.body.bio || "",
    };
    const token = await auth.generateToken({
      username: request.body.username,
      expiresIn: request.body.expiresIn || "1d",
    });
    const user = await db.create(UserModel, userObject);
    return { message: "User Created", data: { user }, token };
  } catch (error: any) {
    return { error };
  }
};

const updateUser = async (request: CreateUserDto): Promise<ResponseDto> => {
  try {
    const user: User = await db.findOneAndUpdate(
      UserModel,
      { username: request.body.username },
      request.body,
      { new: true }
    );
    return { message: "User Credentials updated", data: user };
  } catch (error: any) {
    return { error: error.message };
  }
};

const deleteUser = async (request: GetUserDto): Promise<ResponseDto> => {
  try {
    await db.deleteOne(UserModel, { username: request.headers.username });
    return { message: "User Deleted" };
  } catch (error: any) {
    return { error: error.message };
  }
};

const login = async (request: LoginDto): Promise<ResponseDto> => {
  try {
    const user: User = await db.findOne(UserModel, {
      username: request.body.username,
    });
    if (user) {
      const isValid = await es.compare(request.body.password, user.password);
      if (isValid) {
        const token = await auth.generateToken({
          username: request.body.username,
          expiresIn: request.body.expiresIn || "1d",
        });
        return { message: "User Logged In", data: user, token };
      } else {
        return { message: "Invalid Credentials" };
      }
    } else {
      return { message: "User Not Found" };
    }
  } catch (error: any) {
    return { error: error };
  }
};

const search = async (request: SearchUserDto): Promise<ResponseDto> => {
  try {
    const users: User[] = await db.findAll(
      UserModel,
      { $text: { $search: `${request.headers.search}` } },
      { score: { $meta: "textScore" } },
      {},
      { score: { $meta: "textScore" } }
    );
    return { data: users };
  } catch (error: any) {
    return { error: error.message };
  }
};

/*-------- Routes --------*/

router.get(
  "/",
  [userMiddleware.loginStatus],
  async (request: GetUserDto, response: any) => {
    const user: ResponseDto = await getUser(request);
    response.send(user);
  }
);

router.get(
  "/search",
  [userMiddleware.loginStatus],
  async (request: SearchUserDto, response: any) => {
    const user: ResponseDto = await search(request);
    response.send(user);
  }
);

router.post("/", async (request: CreateUserDto, response: any) => {
  const newUser: ResponseDto = await createUser(request);
  response.send(newUser);
});

router.put(
  "/",
  [userMiddleware.loginStatus],
  async (request: CreateUserDto, response: any) => {
    const updatedUser: ResponseDto = await updateUser(request);
    response.send(updatedUser);
  }
);

router.put(
  "/",
  [userMiddleware.loginStatus],
  async (request: GetUserDto, response: any) => {
    const res: ResponseDto = await deleteUser(request);
    response.send(res);
  }
);

router.post("/login", async (request: LoginDto, response: any) => {
  const loginStatus: ResponseDto = await login(request);
  response.send(loginStatus);
});

export default router;
