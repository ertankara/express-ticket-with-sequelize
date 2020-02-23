import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { LOCAL_DELETED } from "../utils/constants";

const FUNCTION_NAME = "deleteRecord()";

/**
 *
 * @param model sequelize model to pass to the function
 * @param options // TODO: Explain stuff
 */
const deleteRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    deleteMode = "soft",
    useRequestBodyAtFilter = false,
    useRequestBodyAtUpdate = false,
    softDeleteLabel = { key: "status", value: "deleted" },
    where = {},
    requestParams = []
  }: {
    deleteMode?: "soft" | "hard";
    useRequestBodyAtFilter?: boolean;
    useRequestBodyAtUpdate?: boolean;
    softDeleteLabel?: { key: string; value: any };
    where?: Record<string, any>;
    requestParams: {
      paramName: string;
      passAs?: string;
    }[];
  }
) => async (req: Request, res: Response, next: NextFunction) => {
  switch (deleteMode) {
    case "soft":
      {
        let whereFiltersForSoftDelete: Record<string, any> = { ...where };
        const reqestParamFilters: Record<string, any> = {};
        let updateObject = { [softDeleteLabel.key]: softDeleteLabel.value };

        for (const { paramName, passAs } of requestParams) {
          const paramValue = req.params[paramName];

          if (paramValue == null) {
            throw new Error(
              `${FUNCTION_NAME} looking for '${paramName}' in the req.params but failed to find`
            );
          }

          reqestParamFilters[passAs || paramName] = paramValue;
        }

        whereFiltersForSoftDelete = {
          ...whereFiltersForSoftDelete,
          ...reqestParamFilters
        };

        if (useRequestBodyAtFilter) {
          whereFiltersForSoftDelete = {
            ...whereFiltersForSoftDelete,
            ...req.body
          };
        }

        if (useRequestBodyAtUpdate) {
          updateObject = { ...updateObject, ...req.body };
        }

        const deletedRecord = await model.findOne({
          where: whereFiltersForSoftDelete
        });

        const [, affectedRowCount] = await model.update(updateObject, {
          where: whereFiltersForSoftDelete
        });

        res.locals[LOCAL_DELETED] = {
          affectedRowCount,
          deletedRecord
        };
      }
      break;
    case "hard":
      {
        let whereFiltersForHardDelete: Record<string, any> = { ...where };
        const reqestParamFilter: Record<string, any> = {};

        for (const { paramName, passAs } of requestParams) {
          const paramValue = req.params[paramName];

          if (!paramValue) {
            throw new Error(
              `${FUNCTION_NAME} looking for '${paramName}' in the req.params but failed to find`
            );
          }

          reqestParamFilter[passAs || paramName] = paramValue;
        }

        whereFiltersForHardDelete = {
          ...whereFiltersForHardDelete,
          ...reqestParamFilter
        };

        if (useRequestBodyAtFilter) {
          whereFiltersForHardDelete = {
            ...whereFiltersForHardDelete,
            ...req.body
          };
        }

        const deletedRecord = await model.findOne({
          where: whereFiltersForHardDelete
        });

        const affectedRowCount = await model.destroy({
          where: whereFiltersForHardDelete
        });

        res.locals[LOCAL_DELETED] = {
          affectedRowCount,
          deletedRecord
        };
      }
      break;
    default:
      throw new Error(`${FUNCTION_NAME} received unknown deleteMode`);
  } // end of switch

  next();
};

export default deleteRecord;
