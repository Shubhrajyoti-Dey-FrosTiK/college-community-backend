import { DatabaseService } from "../database/database.service";

export class DatabaseValidator {
  db = new DatabaseService();

  async isUnique(model: any, input: any): Promise<boolean> {
    return (await this.db.findOne(model, input)) ? true : false;
  }
}
