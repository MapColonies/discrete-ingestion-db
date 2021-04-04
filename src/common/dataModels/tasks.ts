import { OperationStatus } from './enums';

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
