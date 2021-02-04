import { ILogMethod } from '@map-colonies/mc-logger';
import { StatusMetadata } from '@map-colonies/mc-model-types';
import { DiscreteTaskEntity } from '../DAL/entity/discreteTask';
import { Status } from './constants';

export interface ILogger {
  log: ILogMethod;
}

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface IOpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface IStatusInfo {
  status: Status;
  reason?: string;
}

export interface IDiscreteTaskParams {
  id: string;
  version: string;
}

export interface IDiscreteTaskRequest {
  metadata: StatusMetadata;
  tasks: IPartialTaskRequest[];
}

export interface IDiscreteTaskCreate extends IDiscreteTaskParams, IDiscreteTaskRequest {}

// TODO: delete
// export interface DiscreteTaskTable {
//   id: string;
//   discreteId: string;
//   version: string;
//   metadata: StatusMetadata;
//   updateDate: Date;
//   status: Status;
//   reason: string;
// }

export interface IDiscreteTaskResponse extends IStatusInfo {
  id: string;
  version: string;
  tasks: IPartialTaskResponse[];
  metadata: StatusMetadata;
  updateDate: Date;
}

export interface IDiscreteTaskStatusUpdate extends IDiscreteTaskParams, IStatusInfo {}

export interface IPartialTaskParams {
  id: string;
}

export interface IPartialTaskRequest {
  minZoom: number;
  maxZoom: number;
}

export interface IPartialTaskCreate extends IPartialTaskRequest {
  discrete: DiscreteTaskEntity;
}

// TODO: delete
// export interface PartialTaskTable {
//   discrete: DiscreteTaskEntity;
//   minZoom: number;
//   maxZoom: number;
//   updateDate: Date;
//   status: Status;
//   reason: string;
// }

export interface IPartialTaskResponse extends IStatusInfo {
  id: string;
  minZoom: number;
  maxZoom: number;
  updateDate: Date;
}

export interface IPartialTaskStatusUpdate extends IPartialTaskParams, IStatusInfo {
  retries?: number;
}
