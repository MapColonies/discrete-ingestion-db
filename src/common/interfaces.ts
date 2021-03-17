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
  status?: Status;
  reason?: string;
  isCleaned?: boolean;
}

export interface ITaskStatusInfo {
  status?: Status;
  reason?: string;
  attempts?: number;
}

export interface IDiscreteTaskParams {
  id: string;
  version: string;
}

export interface IDiscreteTaskQuery {
  status?: Status;
  isCleaned?: boolean;
}

export interface IDiscreteTaskRequest {
  metadata: StatusMetadata;
  tasks: IPartialTaskRequest[];
}

export interface IDiscreteTaskSave extends IDiscreteTaskParams {
  metadata: StatusMetadata;
}

export interface IDiscreteTaskCreate extends IDiscreteTaskParams, IDiscreteTaskRequest {}

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

export interface IPartialTaskResponse extends ITaskStatusInfo {
  id: string;
  minZoom: number;
  maxZoom: number;
  updateDate: Date;
}

export interface IPartialTaskStatusUpdate extends IPartialTaskParams, ITaskStatusInfo {}

export interface IPartialTaskStatusCount {
  status: Status;
  count: string;
}

export interface IPartialTasksStatuses {
  total: number;
  failed: number;
  completed: number;
}
