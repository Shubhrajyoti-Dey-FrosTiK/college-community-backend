import mongoose, {
  Document,
  HydratedDocument,
  model,
  Model,
  Query,
  QueryOptions,
} from "mongoose";

export interface IMongoRequiredFields {
  [key: string]: number;
}

export class DatabaseService {
  async create<T extends Document>(
    model: Model<T>,
    input: any,
    queryOptions: QueryOptions = {}
  ) {
    const val = await await model.create(input);
    return val;
  }

  async findOne<T extends Document>(
    model: any,
    inputQuery: mongoose.FilterQuery<any> = {},
    queryOptions: QueryOptions = {},
    populateOptions: Array<string> = []
  ): Promise<T> {
    return await model
      .findOne(inputQuery, queryOptions)
      .populate(populateOptions);
  }

  async count<T extends Document>(
    model: mongoose.Model<any>,
    inputQuery: mongoose.FilterQuery<any> = {}
  ): Promise<Number> {
    return await model.count(inputQuery);
  }

  async findOneAndUpdate<T extends Document>(
    model: Model<any>,
    findQuery: mongoose.FilterQuery<any>,
    updateQuery: mongoose.UpdateQuery<any>,
    queryOptions: QueryOptions = {},
    populateOptions: Array<string> = []
  ): Promise<T> {
    return await model
      .findOneAndUpdate(findQuery, updateQuery, queryOptions)
      .populate(populateOptions);
  }

  async updateMany<T extends Document>(
    model: Model<any>,
    findQuery: mongoose.FilterQuery<any>,
    updateQuery: mongoose.UpdateQuery<any>,
    queryOptions: QueryOptions = {}
  ): Promise<any> {
    return await model.updateMany(findQuery, updateQuery, queryOptions);
  }

  async findAll<T extends Document>(
    model: Model<any>,
    inputQuery: mongoose.FilterQuery<any> = {},
    fieldMap: mongoose.FilterQuery<any> = { _id: 0 },
    queryOptions: QueryOptions = {},
    sortOptions: object = {},
    populateOptions: Array<string> = [],
    pageNumber: number = 1,
    pageSize: number = 100,
    limit: number = 100
  ): Promise<T[]> {
    return await model
      .find(inputQuery, fieldMap, queryOptions)
      .populate(populateOptions)
      .sort(sortOptions)
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(limit);
  }

  async aggregate<T extends Document>(
    model: Model<any>,
    inputQuery: Array<mongoose.PipelineStage>
  ): Promise<T[]> {
    return await model.aggregate(inputQuery);
  }

  async deleteOne<T extends Document>(
    model: Model<any>,
    inputQuery: any
  ): Promise<T> {
    return await model.findOneAndDelete(inputQuery);
  }
}
