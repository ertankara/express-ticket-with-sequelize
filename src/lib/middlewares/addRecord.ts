import { Request, Response, NextFunction } from "express";
import { Model } from "sequelize";

/**
 * Creates a row in database for the given `Model` e.g if User is passed as model
 * then creates a user row in the Users table
 * @param model Sequelize model object
 */
const addRecord = <M extends Model>(
  model: { new (): M } & typeof Model
) => async (req: Request, res: Response, next: NextFunction) => {
  const newRecord = await model.create(req.body);
  res.addedRecordResults = { newRecord };
  next();
};

export default addRecord;
