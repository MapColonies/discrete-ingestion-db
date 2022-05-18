export const DEFAULT_SERVER_PORT = 80;

export enum Services {
  LOGGER = 'ILogger',
  CONFIG = 'IConfig',
}

export enum Status {
  PENDING = 'Pending',
  PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export enum SearchOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ResponseCodes {
  JOB_UPDATED = 'JOB_UPDATED_SUCCESSFULLY',
  JOB_DELETED = 'JOB_DELETED_SUCCESSFULLY',
  JOB_RESET = 'JOB_RESET_SUCCESSFULLY',
  JOB_ABORTED = 'JOB_ABORTED_SUCCESSFULLY',
  TASK_UPDATED = 'TASK_UPDATED_SUCCESSFULLY',
  TASK_DELETED = 'TASK_DELETED_SUCCESSFULLY',
  UPDATE_EXPIRED_STATUS = 'UPDATE_EXPIRED_STATUS_SUCCESSFULLY',
}
