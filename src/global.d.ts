declare namespace Express {
  export interface Response {
    paginatedResults: Record<string, any>[];
    updatedRecordResults: {
      updatedRecord: Record<string, any> | null;
      affectedRowCount: any; // number | undefined;
      updatedRecordId: any; // number | string | undefined;
    };
    deletedRecordResults: {
      deletedRecord: Record<string, any> | null;
      affectedRowCount: any; // number | undefined;
      deletedRecordId: any; // string | number | undefined;
    };
    createdRecordResults: {
      newRecord: Record<string, any>;
    };
  }
}
