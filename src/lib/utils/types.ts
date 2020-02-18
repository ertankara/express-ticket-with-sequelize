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
