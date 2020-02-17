export type AddRecordReturnValue = {
  newRecord: Record<string, any>;
  RecordId: number | string;
};

export type UpdateRecordReturnValue = {
  updatedRecord: Record<string, any> | Record<string, any>[];
  updatedRecordId: number | string;
  numberOfRowsUpdated: number;
};

export type DeleteRecordReturnValue = {};

export type GetRecordReturnValue = {};

export type FilterParams = {
  field: string;
  expectedToEqual: string | number | boolean;
};

export type UpdateRecordParams = {
  fieldsToUpdate: { field: string; value: any }[];
};

export type DeleteOnConditions = {
  statusKey?: string;
  statusValue?: any;
};

export type IdentifierKeys = { fkIfPassedPkElsePk: string; pk?: string };

export type PaginationParams = {
  pageSizeVariableName: number;
  pageNumberVariableName: number;
};
