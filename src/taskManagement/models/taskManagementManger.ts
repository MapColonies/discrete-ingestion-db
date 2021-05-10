import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { EntityNotFound } from '../../common/errors';
import { TaskRepository } from '../../DAL/repositories/taskRepository';
import { IFindInactiveTasksRequest, IGetTaskResponse, IRetrieveAndStartRequest } from '../../common/dataModels/tasks';

@injectable()
export class TaskManagementManager {
  private repository?: TaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async retrieveAndStart(req: IRetrieveAndStartRequest): Promise<IGetTaskResponse> {
    const repo = await this.getRepository();
    this.logger.log(
      'info',
      `try to start task by retrieving and updating to "In-Progress" for job type: ${req.jobType} and task type: ${req.taskType}`
    );
    const res = await repo.retrieveAndUpdate(req.jobType, req.taskType);
    if (res === undefined) {
      throw new EntityNotFound('Pending task was not found');
    }
    this.logger.log('info', `started task: ${res.id} of job: ${res.jobId}`);
    return res;
  }

  public async releaseInactive(tasks: string[]): Promise<string[]> {
    const repo = await this.getRepository();
    this.logger.log('info', `trying to release dead tasks: ${tasks.join(',')}`);
    const releasedTasks = await repo.releaseInactiveTask(tasks);
    this.logger.log('info', `released dead tasks: ${releasedTasks.join(',')}`);
    return releasedTasks;
  }

  public async getInactiveTasks(req: IFindInactiveTasksRequest): Promise<string[]> {
    const repo = await this.getRepository();
    this.logger.log(
      'info',
      `finding tasks inactive for longer then ${req.inactiveTimeSec} seconds, with types: ${req.types ? req.types.join() : 'any'}`
    );
    const res = repo.findInactiveTasks(req);
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
