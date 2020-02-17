import { Request, Response, NextFunction } from "express";
import { Model } from "sequelize";

/**
 * Creates a row in database for the given `Model` e.g if User is passed as model
 * then creates a user row in the Users table
 * @param model Sequelize model object
 * @returns { }
 */
const addRecord = <M extends Model>(
  model: { new (): M } & typeof Model
) => async (req: Request, res: Response, next: NextFunction) => {
  await model.create(req.body);
  next();
};

export default addRecord;
