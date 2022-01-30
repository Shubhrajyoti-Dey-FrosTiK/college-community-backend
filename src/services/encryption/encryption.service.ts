import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export class EncryptionService {
  salt = Number(process.env.SALT_ROUNDS);

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
