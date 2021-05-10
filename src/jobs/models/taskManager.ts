import { inject, injectable } from 'tsyringe';
import httpStatus from 'http-status-codes';
import { Services } from '../../common/constants';
import { IHttpResponse, ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { EntityNotFound } from '../../common/errors';
import { TaskRepository } from '../../DAL/repositories/taskRepository';
import {
  CreateTasksRequest,
  CreateTasksResponse,
  GetTasksResponse,
  IAllTasksParams,
  IGetTaskResponse,
  ISpecificTaskParams,
  IUpdateTaskRequest,
} from '../../common/dataModels/tasks';

@injectable()
export class TaskManager {
  private repository?: TaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async getAllTasks(req: IAllTasksParams): Promise<IHttpResponse<GetTasksResponse | string>> {
    const repo = await this.getRepository();
    const res = await repo.getTasks(req);
    if (res.length === 0) {
      return {
        body: 'No tasks',
        status: httpStatus.NO_CONTENT,
      };
    }
    return {
      body: res,
      status: httpStatus.OK,
    };
  }

  public async createTask(req: CreateTasksRequest): Promise<CreateTasksResponse> {
    const repo = await this.getRepository();
    const jobId = Array.isArray(req) ? req[0].jobId : req.jobId;
    this.logger.log('info', `creating task(s) for job ${jobId}`);
    const res = await repo.createTask(req);
    return res;
  }

  public async getTask(req: ISpecificTaskParams): Promise<IGetTaskResponse> {
    const repo = await this.getRepository();
    const res = await repo.getTask(req);
    if (res === undefined) {
      throw new EntityNotFound('Task not found');
    }
    return res;
  }

  public async updateTask(req: IUpdateTaskRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `updating task ${req.taskId} from job ${req.jobId}`);
    await repo.updateTask(req);
  }

  public async deleteTask(req: ISpecificTaskParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `deleting task ${req.taskId} from job ${req.jobId}`);
    const res = await repo.deleteTask(req);
    return res;
  }

  private async getRepository(): Promise<TaskRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getTaskRepository();
    }
    return this.repository;
  }
}
