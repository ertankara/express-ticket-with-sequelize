import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { PaginationParams } from "../utils/types";
import {
  BASE_PAGE_NUMBER,
  LOCAL_PAGINATED_RECORDS,
  LOCAL_RAW_LIST
} from "../utils/constants";

/**
 *
 * Obtains pagination parameters from `req.query`
 * https://codeforgeek.com/server-side-pagination-using-node-and-mongo/
 * skip = size * (pageNumber - 1)
 * @param model Sequelize model that is passed
 * @param paginationParams If pagination params are different than `page` and `pageSize`
 *                         then keys are needed to be provided so they can be obtained
 *                         from the `req.query`
 * @param filters Filter data with conditions
 */
const getPaginatedResults = <
  M extends TSSequelizeModel,
  K extends SequelizeModel
>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    paginationParams = null,
    where = {}
  }: {
    paginationParams?: PaginationParams | null;
    where?: Record<string, any>;
  } = {}
) => async (req: Request, res: Response, next: NextFunction) => {
  let pageNumber;
  let pageSizeNumber;

  // If query params are named to something other than `page` and `pageSize`
  // then use user defined names, else look for to `page` and `pageSize` variables
  // in the query parameters, if they are found return paginated results
  // else do not do anything and let go
  if (paginationParams != null) {
    const { pageSizeVariableName, pageNumberVariableName } = paginationParams;
    const {
      [pageSizeVariableName]: presetPageSize,
      [pageNumberVariableName]: presetPageNumber
    } = req.query;

    pageNumber = presetPageNumber;
    pageSizeNumber = presetPageSize;
  } else {
    const { pageSize, page } = req.query;
    pageNumber = page;
    pageSizeNumber = pageSize;
  }

  let [normalizedPage, normalizedPageSize] = [pageNumber, pageSizeNumber]
    .map((param: string) => Number.parseInt(param))
    .filter((param: number) => !Number.isNaN(param));

  // If both of the pagination params are not found pass request to the next middlewware
  if (
    (normalizedPageSize !== 0 && !normalizedPageSize) ||
    (normalizedPage !== 0 && !normalizedPage)
  ) {
    const rawList = await model.findAll({
      where: { ...where }
    });

    res.locals[LOCAL_RAW_LIST] = rawList;
    return next();
  }

  // It breaks SQL query if `normalizedPage` is less than 0 while querying
  normalizedPage =
    normalizedPage < BASE_PAGE_NUMBER ? BASE_PAGE_NUMBER : normalizedPage;

  const results = await model.findAll({
    offset: (normalizedPage - 1) * normalizedPageSize,
    limit: normalizedPageSize,
    where: { ...where }
  });

  res.locals[LOCAL_PAGINATED_RECORDS] = results;

  next();
};

export default getPaginatedResults;
