import { OperationStatus } from './enums';
import { IFindJobsRequest, IJobsParams } from './jobs';

//requests
export interface IAllTasksParams {
  jobId: string;
}

export interface ISpecificTaskParams extends IAllTasksParams {
  taskId: string;
}

export interface ICreateTaskBody {
  description?: string;
  parameters: Record<string, unknown>;
  reason?: string;
  type?: string;
  status?: OperationStatus;
  attempts?: number;
}

export type CreateTasksBody = ICreateTaskBody | ICreateTaskBody[];

export interface ICreateTaskRequest extends IAllTasksParams, ICreateTaskBody {}

export type CreateTasksRequest = ICreateTaskRequest | ICreateTaskRequest[];

export interface IUpdateTaskBody {
  description?: string;
  parameters?: Record<string, unknown>;
  status: OperationStatus;
  percentage?: number;
  reason?: string;
  attempts?: number;
}

export interface IUpdateTaskRequest extends ISpecificTaskParams, IUpdateTaskBody {}

export interface ITaskType {
  jobType: string;
  taskType: string;
}

export interface IRetrieveAndStartRequest extends ITaskType {}

export interface IFindInactiveTasksRequest {
  inactiveTimeSec: number;
  types?: ITaskType[];
}

//responses
export interface IGetTaskResponse {
  id: string;
  jobId: string;
  description?: string;
  parameters?: Record<string, unknown>;
  created: Date;
  updated: Date;
  status: OperationStatus;
  percentage?: number;
  reason?: string;
  attempts: number;
}

export type GetTasksResponse = IGetTaskResponse[];

export interface ICreateTaskResponse {
  id: string;
}
export interface ICreateTasksResponse {
  ids: string[];
}

export type CreateTasksResponse = ICreateTaskResponse | ICreateTasksResponse;

export interface IFindTasksPayload extends IFindJobsRequest, IJobsParams {
  taskId: string;
  priority: number;
  jobParameters?: Record<string, unknown>;
  taskMetadata: IUpdateTaskBody;
}
