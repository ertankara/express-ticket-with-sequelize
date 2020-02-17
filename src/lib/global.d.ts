declare namespace Express {
  export interface Response {
    paginatedResults: Record<string, any>[];
    updatedRecordResults: {
      updatedRecord: Record<string, any>;
      affectedRowCount: number;
      updatedRecordId: number | string;
    };
    deletedRecordResults: {
      deletedRecord: Record<string, any>;
      affectedRowCount: number;
      deletedRecordId: string | number;
    };
    addedRecordResults: {
      newRecord: Record<string, any>;
    };
  }
}
