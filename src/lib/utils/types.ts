export type DeleteStatusKey = {
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
