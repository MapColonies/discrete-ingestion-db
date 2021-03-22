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

export interface IHttpResponse<T> {
  body: T;
  status: number;
}
