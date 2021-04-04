//requests
import { OperationStatus } from './enums';
import { GetTasksResponse, ICreateTaskBody } from './tasks';

export interface IJobsParams {
  jobId: string;
}
export interface IFindJobsRequest {
  resourceId?: string;
  version?: string;
  isCleaned?: boolean;
  status?: OperationStatus;
  type?: string;
}

export interface ICreateJobBody {
  resourceId: string;
  version: string;
  parameters: Record<string, unknown>;
  type: string;
  description?: string;
  status?: OperationStatus;
  reason?: string;
  tasks?: ICreateTaskBody[];
}

export interface IUpdateJobBody {
  parameters?: Record<string, unknown>;
  status?: OperationStatus;
  percentage?: number;
  reason?: string;
  isCleaned?: boolean;
}

export interface IUpdateJobRequest extends IJobsParams, IUpdateJobBody {}

//responses
export type FindJobsResponse = IGetJobResponse[];

export interface IGetJobResponse {
  id: string;
  resourceId?: string;
  version?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  reason?: string;
  tasks?: GetTasksResponse;
  created: Date;
  updated: Date;
  status?: OperationStatus;
  percentage?: number;
  isCleaned: boolean;
}

export interface ICreateJobResponse {
  id: string;
  taskIds: string[];
}
