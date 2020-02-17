import { Request, Response, NextFunction } from "express";
import { Model } from "sequelize";
import { IdentifierKeys } from "../utils/types";

/**
 * Relies on `req.body` to update the record
 * @param model Sequelize model that is passed
 * @param identifier foreign and primary keys to find the record, the key is
 *                   retrieved from the `req.params` which forces you to be semantic
 *                   with REST
 */
const updateEntry = <M extends Model>(
  model: { new (): M } & typeof Model,
  identifier: IdentifierKeys
) => async (req: Request, res: Response, next: NextFunction) => {
  // If both keys are not present, then assume only primary key is provided
  const { fkIfPassedPkElsePk, pk } = identifier;
  const { [fkIfPassedPkElsePk]: id } = req.params;
  const primaryKey = pk || fkIfPassedPkElsePk;

  const [, affectedRowCount] = await model.update(req.body, {
    where: { [primaryKey]: id }
  });

  // TODO: MySql doesn't support `returning` but postgres does so it must be
  // optional to do seperate `findOne` record
  const updatedRecord = await model.findOne({
    where: { [primaryKey]: id }
  });

  res.updatedRecordResults = {
    updatedRecord,
    affectedRowCount,
    updatedRecordId: primaryKey
  };

  next();
};

export default updateEntry;
