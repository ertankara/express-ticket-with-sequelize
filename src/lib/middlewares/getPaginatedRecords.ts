import { Request, Response, NextFunction } from "express";
import { Model as TSSequelizeModel } from "sequelize-typescript";
import { Model as SequelizeModel } from "sequelize";
import { PaginationParams } from "../utils/types";
import {
  BASE_PAGE_NUMBER,
  LOCAL_PAGINATED_RECORDS,
  LOCAL_RAW_LIST
} from "../utils/constants";

const getPaginatedResults = <
  M extends TSSequelizeModel,
  K extends SequelizeModel
>(
  model:
    | ({ new (): M } & typeof TSSequelizeModel)
    | ({ new (): K } & typeof SequelizeModel),
  {
    paginationParams = null,
    where = {},
    queryFilters = []
  }: {
    paginationParams?: PaginationParams | null;
    where?: Record<string, any>;
    queryFilters?: { queryParam: string; expectedToBeEqualTo: any }[];
  } = {}
) => async (req: Request, res: Response, next: NextFunction) => {
  let pageNumber;
  let pageSizeNumber;
  let rest;

  // If query params are named to something other than `page` and `pageSize`
  // then use user defined names, else look for to `page` and `pageSize` variables
  // in the query parameters, if they are found return paginated results
  // else do not do anything and let go
  if (paginationParams != null) {
    const { pageSizeVariableName, pageNumberVariableName } = paginationParams;
    const {
      [pageSizeVariableName]: presetPageSize,
      [pageNumberVariableName]: presetPageNumber,
      ...all
    } = req.query;

    pageNumber = presetPageNumber;
    pageSizeNumber = presetPageSize;
    rest = all;
  } else {
    const { pageSize, page, ...all } = req.query;
    pageNumber = page;
    pageSizeNumber = pageSize;
    rest = all;
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
