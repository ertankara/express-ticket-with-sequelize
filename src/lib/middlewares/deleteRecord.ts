import { Request, Response, NextFunction } from "express";
import { Model } from "sequelize";
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
const deleteRecord = <M extends Model>(
  model: { new (): M } & typeof Model,
  identifier: IdentifierKeys,
  conditionParams: DeleteOnConditions = {},
  deleteMode: DeleteMode = DeleteMode.soft
) => async (req: Request, res: Response, next: NextFunction) => {
  const { statusKey, statusValue } = conditionParams;
  // If both keys are not present, then assume only primary key is provided
  const { fkIfPassedPkElsePk, pk } = identifier;
  const { [fkIfPassedPkElsePk]: id } = req.params;

  switch (deleteMode) {
    case DeleteMode.soft:
      if (statusKey == null || statusValue == null)
        throw new Error(
          "deleteRecord() requires `statusKey` and `statusValue` to be set when applying `soft` delete"
        );
      await model.update(
        { [statusKey]: statusValue },
        { where: { [pk || fkIfPassedPkElsePk]: id } }
      );
      break;
    case DeleteMode.hard:
      await model.destroy({ where: { [pk || fkIfPassedPkElsePk]: id } });
      break;
    default:
      throw new Error("deleteEntry() received unknown deleteMode");
  }

  next();
};

export default deleteRecord;
