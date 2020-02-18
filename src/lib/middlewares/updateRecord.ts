import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { IdentifierKeys } from "../utils/types";
import { LOCAL_UPDATED } from "../utils/constants";

/**
 * Relies on `req.body` to update the record
 * @param model Sequelize model that is passed
 * @param identifier foreign and primary keys to find the record, the key is
 *                   retrieved from the `req.params` which forces you to be semantic
 *                   with REST
 */
const updateRecord = <M extends TSSequelizeModel, K extends SequelizeModel>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    identifier,
    returning = false,
    where = {}
  }: {
    identifier: IdentifierKeys;
    returning?: boolean;
    where: Record<string, any>;
  }
) =>
  // identifier: IdentifierKeys,
  // returning = false
  async (req: Request, res: Response, next: NextFunction) => {
    // If both keys are not present, then assume only primary key is provided
    const { fkIfPassedPkElsePk, pk } = identifier;
    const { [fkIfPassedPkElsePk]: id } = req.params;
    const primaryKey = pk || fkIfPassedPkElsePk;

    const [, affectedRowCount] = await model.update(req.body, {
      where: { ...{ [primaryKey]: id }, ...where }
    });

    // TODO: MySql doesn't support `returning` but postgres does so it must be
    // optional to do seperate `findOne` operation
    let updatedRecord = null;
    if (returning) {
      updatedRecord = await model.findOne({
        where: { [primaryKey]: id }
      });
    }
    res.locals[LOCAL_UPDATED] = {
      updatedRecord,
      affectedRowCount,
      updatedRecordId: primaryKey
    };

    next();
  };

export default updateRecord;
