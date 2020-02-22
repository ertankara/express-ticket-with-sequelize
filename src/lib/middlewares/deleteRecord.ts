import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { DeleteMode } from "../utils/enums";
import { DeleteStatusKey, IdentifierKeys } from "../utils/types";
import { LOCAL_DELETED } from "../utils/constants";

const FUNCTION_NAME = "deleteRecord()";

/**
 *
 * @param model
 * deleteMode,
 * useRequestBody: boolean,
 * deleteStateKey: string,
 * deleteStateValue: string | boolean,
 * where sequelize where
 * requestParams: { paramName: string; passAs?: string }[]
 *
 * @param options
 */

/**
 *
 * @param model Represents sequelize model to pass
 * @param conditionParams if it's a soft delete, indicate the `statusKey` e.g `status`
 *                         and the value it'll take when deleted e.g `'deleted'` | true
 *                         lastly `where` conditions to find the records to delete
 * @param deleteMode has two modes `soft` updates the deleted status of the record
 *                   while `hard` deletes the record completely and NOT UNDOABLE
 *                   => defaults to soft
 */
const deleteRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    deleteMode = DeleteMode.soft,
    useRequestBodyAtFilter = false,
    useRequestBodyAtUpdate = false,
    softDeleteLabel = { key: "status", value: "deleted" },
    where = {},
    requestParams
  }: {
    deleteMode?: DeleteMode;
    useRequestBodyAtFilter?: boolean;
    useRequestBodyAtUpdate?: boolean;
    softDeleteLabel?: { key: string; value: any };
    where?: Record<string, any>;
    requestParams: {
      paramName: string;
      passAs?: string;
    }[];
  }
) =>
  // {
  //   identifier,
  //   conditionParams,
  //   deleteMode = DeleteMode.soft,
  //   where = {}
  // }: {
  //   identifier: IdentifierKeys;
  // }
  async (req: Request, res: Response, next: NextFunction) => {
    switch (deleteMode) {
      case DeleteMode.soft:
        {
          let whereFiltersForSoftDelete: Record<string, any> = { ...where };
          const reqestParamFilters: Record<string, any> = {};
          let updateObject = { [softDeleteLabel.key]: softDeleteLabel.value };

          for (const { paramName, passAs } of requestParams) {
            const paramValue = req.params[paramName];

            if (!paramValue) {
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
      case DeleteMode.hard:
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
    }

    // const { statusKey, statusValue } = conditionParams;
    // // If both keys are not present, then assume only primary key is provided
    // const { fkIfPassedPkElsePk, pk } = identifier;
    // const { [fkIfPassedPkElsePk]: id } = req.params;
    // const primaryKey = pk || fkIfPassedPkElsePk;
    // switch (deleteMode) {
    //   case DeleteMode.soft:
    //     if (statusKey == null || statusValue == null)
    //       throw new Error(
    //         `${FUNCTION_NAME} requires 'statusKey' and 'statusValue' to be set when applying 'soft' delete`
    //       );
    //     const deletedRecord = await model.findOne({
    //       where: { [primaryKey]: id }
    //     });
    //     const [, affectedRowCount] = await model.update(
    //       { [statusKey]: statusValue },
    //       { where: { ...{ [primaryKey]: id }, ...where } }
    //     );
    //     res.locals[LOCAL_DELETED] = {
    //       affectedRowCount,
    //       deletedRecord,
    //       deletedRecordId: id
    //     };
    //     break;
    //   case DeleteMode.hard:
    //     const deletedRecordId = await model.destroy({
    //       where: { ...{ [primaryKey]: id }, ...where }
    //     });
    //     res.locals[LOCAL_DELETED] = {
    //       deletedRecordId
    //     };
    //     break;
    //   default:
    //     throw new Error(`${FUNCTION_NAME} received unknown deleteMode`);
    // }
    // next();
  };

export default deleteRecord;
