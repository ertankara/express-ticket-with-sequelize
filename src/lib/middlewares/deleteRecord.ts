import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { DeleteMode } from "../utils/enums";
import { DeleteOnConditions, IdentifierKeys } from "../utils/types";
import { LOCAL_DELETED_RECORD_RESULT } from "../utils/constants";

const FUNCTION_NAME = "deleteRecord()";

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
    identifier,
    conditionParams,
    deleteMode = DeleteMode.soft
  }: {
    identifier: IdentifierKeys;
    conditionParams: DeleteOnConditions;
    deleteMode?: DeleteMode;
  }
) => async (req: Request, res: Response, next: NextFunction) => {
  const { statusKey, statusValue } = conditionParams;
  // If both keys are not present, then assume only primary key is provided
  const { fkIfPassedPkElsePk, pk } = identifier;
  const { [fkIfPassedPkElsePk]: id } = req.params;
  const primaryKey = pk || fkIfPassedPkElsePk;

  switch (deleteMode) {
    case DeleteMode.soft:
      if (statusKey == null || statusValue == null)
        throw new Error(
          `${FUNCTION_NAME} requires 'statusKey' and 'statusValue' to be set when applying 'soft' delete`
        );

      const deletedRecord = await model.findOne({
        where: { [primaryKey]: id }
      });

      const [, affectedRowCount] = await model.update(
        { [statusKey]: statusValue },
        { where: { [primaryKey]: id } }
      );

      res.locals[LOCAL_DELETED_RECORD_RESULT] = {
        affectedRowCount,
        deletedRecord,
        deletedRecordId: id
      };
      break;
    case DeleteMode.hard:
      const deletedRecordId = await model.destroy({
        where: { [primaryKey]: id }
      });
      res.locals[LOCAL_DELETED_RECORD_RESULT] = {
        deletedRecordId
      };
      break;
    default:
      throw new Error(`${FUNCTION_NAME} received unknown deleteMode`);
  }

  next();
};

export default deleteRecord;
