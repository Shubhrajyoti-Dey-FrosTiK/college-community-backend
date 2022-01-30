import jwt, { JwtPayload } from "jsonwebtoken";

export interface TokenGeneratorDto {
  username: string;
  expiresIn: number | string;
}

export class AuthenticationService {
  constructor() {}

  secret: string = process.env.JWT_SECRET || "secret";

  async generateToken(user: TokenGeneratorDto): Promise<string> {
    const token = jwt.sign({ username: user.username }, this.secret, {
      expiresIn: user.expiresIn,
    });
    return token;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.secret);
      return true;
    } catch {
      return false;
    }
  }
}
