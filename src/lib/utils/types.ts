import { DeleteMode } from "./enums";

export type PaginateRecordFunctionParams = {
  paginationParams: PaginationParams | null;
  filters: FilterParams[] | undefined;
};

export type UpdateRecordFunctionParams = {
  identifier: IdentifierKeys;
  returning: boolean;
};

export type DeleteRecordFunctionParams = {
  identifier: IdentifierKeys;
  conditionParams: DeleteOnConditions;
  deleteMode: DeleteMode;
};

export type FilterParams = {
  field: string;
  expectedToEqual: string | number | boolean;
};

export type DeleteOnConditions = {
  statusKey?: string;
  statusValue?: any;
};

export type IdentifierKeys = { fkIfPassedPkElsePk: string; pk?: string };

export type PaginationParams = {
  pageSizeVariableName: string;
  pageNumberVariableName: string;
};

export type ResponseUpdatePayload = {
  updatedRecord: Record<string, any> | null;
  affectedRowCount: number | undefined;
  updatedRecordId: number | string | undefined;
};

export type ResponseDeletePayload = {
  deletedRecord: Record<string, any> | null;
  affectedRowCount: number | undefined;
  deletedRecordId: string | number | undefined;
};

export type ResponseCreatePayload = {
  newRecord: Record<string, any>;
};

export type ResponsePaginatedPayload = Record<string, any>[];
