import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { LOCAL_CREATED_RECORD_RESULT } from "../utils/constants";

/**
 * Creates a row in database for the given `Model` e.g if User is passed as model
 * then creates a user row in the Users table
 * @param model Sequelize model object
 */
const createRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel)
) => async (req: Request, res: Response, next: NextFunction) => {
  const newRecord = await model.create(req.body);
  res.locals[LOCAL_CREATED_RECORD_RESULT] = { newRecord };
  next();
};

export default createRecord;
