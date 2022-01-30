import { NextFunction, Request, Response } from "express";

/*-------- Dto --------*/
import { AuthenticationService } from "../services/auth/authentication.service";

export class UserMiddleware {
  async loginStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const auth = new AuthenticationService();
    const token: string = request.headers.authorization || "";
    const authenticated = await auth.verifyToken(token);
    if (authenticated) {
      next();
    } else {
      response.send({
        message: "You are not logged in",
      });
    }
  }
}
