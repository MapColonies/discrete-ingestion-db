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
