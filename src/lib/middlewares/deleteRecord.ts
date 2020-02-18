import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { DeleteMode } from "../utils/enums";
import { DeleteOnConditions, IdentifierKeys } from "../utils/types";

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
  identifier: IdentifierKeys,
  conditionParams: DeleteOnConditions = {},
  deleteMode: DeleteMode = DeleteMode.soft
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
          "deleteRecord() requires `statusKey` and `statusValue` to be set when applying `soft` delete"
        );

      const deletedRecord = await model.findOne({
        where: { [primaryKey]: id }
      });

      const [, affectedRowCount] = await model.update(
        { [statusKey]: statusValue },
        { where: { [primaryKey]: id } }
      );

      res.deletedRecordResults = {
        affectedRowCount,
        deletedRecord,
        deletedRecordId: 0 //  deletedRecord ? deletedRecord[primaryKey] : -1
      };
      break;
    case DeleteMode.hard:
      await model.destroy({ where: { [primaryKey]: id } });
      break;
    default:
      throw new Error("deleteEntry() received unknown deleteMode");
  }

  next();
};

export default deleteRecord;
