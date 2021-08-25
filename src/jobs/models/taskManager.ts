import { container, inject, injectable } from 'tsyringe';
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
  IGetTasksStatus,
  ISpecificTaskParams,
  IUpdateTaskRequest,
} from '../../common/dataModels/tasks';
import { OperationStatus } from '../../common/dataModels/enums';
import { JobManager } from './jobManager';

@injectable()
export class TaskManager {
  private repository: TaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {
    this.getRepository()
      .then((repo) => {
        this.repository = repo;
      })
      .catch((err) => {
        throw err;
      });
  }

  public async getAllTasks(req: IAllTasksParams): Promise<IHttpResponse<GetTasksResponse | string>> {
    const res = await this.repository.getTasks(req);
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
    const jobId = Array.isArray(req) ? req[0].jobId : req.jobId;
    this.logger.log('info', `creating task(s) for job ${jobId}`);
    const res = await this.repository.createTask(req);
    return res;
  }

  public async getTask(req: ISpecificTaskParams): Promise<IGetTaskResponse> {
    const res = await this.repository.getTask(req);
    if (res === undefined) {
      throw new EntityNotFound('Task not found');
    }
    return res;
  }

  public async updateTask(req: IUpdateTaskRequest): Promise<void> {
    this.logger.log('info', `updating task ${req.taskId} from job ${req.jobId}`);
    await this.repository.updateTask(req);
  }

  public async deleteTask(req: ISpecificTaskParams): Promise<void> {
    this.logger.log('info', `deleting task ${req.taskId} from job ${req.jobId}`);
    const res = await this.repository.deleteTask(req);
    return res;
  }

  public async getTaskStatus(req: IAllTasksParams): Promise<IGetTasksStatus> {
    const jobManager = container.resolve(JobManager);
    const { version: resourceVersion, resourceId } = await jobManager.getJob(req);

    const tasks = await this.repository.getTasks(req);
    this.logger.log('info', `Getting tasks statuses for jobId ${req.jobId}`);
    const completedTasksCount = tasks.filter((task) => task.status === OperationStatus.COMPLETED).length;
    const failedTasksCount = tasks.filter((task) => task.status === OperationStatus.FAILED).length;
    const allTasksCompleted = completedTasksCount === tasks.length;

    const tasksStatus: IGetTasksStatus = {
      allTasksCompleted,
      completedTasksCount,
      failedTasksCount,
      resourceId,
      resourceVersion,
    };

    return tasksStatus;
  }

  private async getRepository(): Promise<TaskRepository> {
    if (!this.connectionManager.isConnected()) {
      await this.connectionManager.init();
    }
    this.repository = this.connectionManager.getTaskRepository();
    return this.repository;
  }
}
