import getPaginatedRecords from "./lib/middlewares/getPaginatedRecords";
import createRecord from "./lib/middlewares/createRecord";
import deleteRecord from "./lib/middlewares/deleteRecord";
import updateRecord from "./lib/middlewares/updateRecord";

import {
  LOCAL_CREATED_RECORD_RESULT,
  LOCAL_DELETED_RECORD_RESULT,
  LOCAL_PAGINATED_RESULT,
  LOCAL_UPDATED_RECORD_RESULT
} from "./lib/utils/constants";

export {
  getPaginatedRecords,
  createRecord,
  deleteRecord,
  updateRecord,
  LOCAL_CREATED_RECORD_RESULT,
  LOCAL_DELETED_RECORD_RESULT,
  LOCAL_PAGINATED_RESULT,
  LOCAL_UPDATED_RECORD_RESULT
};
