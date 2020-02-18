import getPaginatedRecords from "./lib/middlewares/getPaginatedRecords";
import createRecord from "./lib/middlewares/createRecord";
import deleteRecord from "./lib/middlewares/deleteRecord";
import updateRecord from "./lib/middlewares/updateRecord";

import {
  LOCAL_CREATED,
  LOCAL_DELETED,
  LOCAL_PAGINATED,
  LOCAL_UPDATED
} from "./lib/utils/constants";

export {
  getPaginatedRecords,
  createRecord,
  deleteRecord,
  updateRecord,
  LOCAL_CREATED,
  LOCAL_DELETED,
  LOCAL_PAGINATED,
  LOCAL_UPDATED
};
