import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import {
  LOCAL_AFFECTED_RECORDS,
  LOCAL_AFFECTED_ROW_COUNT
} from "../utils/constants";

const FUNCTION_NAME = "updateRecord()";

/**
 *
 * @param model sequelize model to pass
 * @param options // TODO: Explain stuff
 */
const updateRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    requestParams = [],
    returning = false,
    where = {}
  }: {
    requestParams: { paramName: string; passAs?: string }[];
    where?: Record<string, any>;
    returning?: boolean;
  }
) => async (req: Request, res: Response, next: NextFunction) => {
  const whereFiltersForUpdate = { ...where };
  const reqestParamFilters: Record<string, any> = {};

  for (const { paramName, passAs } of requestParams) {
    const paramValue = req.params[paramName];

    if (paramValue == null) {
      throw new Error(
        `${FUNCTION_NAME} looking for '${paramName}' in the req.params but failed to find`
      );
    }

    reqestParamFilters[passAs || paramName] = paramValue;
  }

  const [affectedRowCount] = await model.update(req.body, {
    where: { ...whereFiltersForUpdate, ...reqestParamFilters }
  });

  let updatedRecords;

  if (returning) {
    updatedRecords = await model.findAll({
      where: { ...whereFiltersForUpdate, ...reqestParamFilters }
    });
  }

  res.locals[LOCAL_AFFECTED_RECORDS] = updatedRecords;
  res.locals[LOCAL_AFFECTED_ROW_COUNT] = affectedRowCount;

  next();
};

export default updateRecord;
