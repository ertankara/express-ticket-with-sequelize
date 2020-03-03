import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import {
  LOCAL_AFFECTED_RECORDS,
  LOCAL_AFFECTED_ROW_COUNT
} from "../utils/constants";

const FUNCTION_NAME = "createRecord()";

/**
 * Creates a row in database for the given `Model` e.g if User is passed as model
 * then creates a user row in the Users table, relies on `req.body`
 * @param model Sequelize model object
 */
const createRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    requestParams = []
  }: { requestParams?: { paramName: string; passAs?: string }[] } = {}
) => async (req: Request, res: Response, next: NextFunction) => {
  // Additional data may be required to collect from the req.params
  // So if user provided a list of the data to collect from the req.params
  // look for them in the req.params object

  const valuesFromParams: Record<string, any> = {};
  for (const { paramName, passAs } of requestParams) {
    const paramValue = req.params[paramName];
    if (paramValue == null) {
      throw new Error(
        `${FUNCTION_NAME} looking for '${paramName}' in the req.params but failed to find`
      );
    }

    valuesFromParams[passAs || paramName] = paramValue;
  }

  const newRecord = await model.create({ ...req.body, ...valuesFromParams });
  res.locals[LOCAL_AFFECTED_RECORDS] = newRecord;
  res.locals[LOCAL_AFFECTED_ROW_COUNT] = 1; // Only one record created at a time
  next();
};

export default createRecord;
