import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { EntityNotFound } from '../../common/errors';
import { TaskRepository } from '../../DAL/repositories/taskRepository';
import { IFindInactiveTasksRequest, IGetTaskResponse, IRetrieveAndStartRequest } from '../../common/dataModels/tasks';
import { JobRepository } from '../../DAL/repositories/jobRepository';
import { OperationStatus } from '../../common/dataModels/enums';
import { IJobsParams } from '../../common/dataModels/jobs';

@injectable()
export class TaskManagementManager {
  private jobRepository?: JobRepository;
  private taskRepository?: TaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async retrieveAndStart(req: IRetrieveAndStartRequest): Promise<IGetTaskResponse> {
    const repo = await this.getTaskRepository();
    this.logger.log(
      'debug',
      `try to start task by retrieving and updating to "In-Progress" for job type: ${req.jobType}, task type: ${req.taskType}`
    );
    const res = await repo.retrieveAndUpdate(req.jobType, req.taskType);
    if (res === undefined) {
      this.logger.log('debug', `Pending task was not found for job type: ${req.jobType}, task type: ${req.taskType}`);
      throw new EntityNotFound('Pending task was not found');
    }
    this.logger.log('info', `started task: ${res.id} of job: ${res.jobId}`);
    return res;
  }

  public async releaseInactive(tasks: string[]): Promise<string[]> {
    const repo = await this.getTaskRepository();
    this.logger.log('info', `trying to release dead tasks: ${tasks.join(',')}`);
    const releasedTasks = await repo.releaseInactiveTask(tasks);
    this.logger.log('info', `released dead tasks: ${releasedTasks.join(',')}`);
    return releasedTasks;
  }

  public async getInactiveTasks(req: IFindInactiveTasksRequest): Promise<string[]> {
    const repo = await this.getTaskRepository();
    this.logger.log(
      'info',
      `finding tasks inactive for longer then ${req.inactiveTimeSec} seconds, with types: ${req.types ? req.types.join() : 'any'}`
    );
    const res = await repo.findInactiveTasks(req);
    return res;
  }

  public async updateExpiredJobsAndTasks(): Promise<void> {
    const jobsRepo = await this.getJobRepository();
    await jobsRepo.updateExpiredJobs();
    const taskRepo = await this.getTaskRepository();
    await taskRepo.updateTasksOfExpiredJobs();
  }

  public async abortJobAndTasks(req: IJobsParams): Promise<void> {
    const jobRepo = await this.getJobRepository();
    await jobRepo.updateJob({ jobId: req.jobId, status: OperationStatus.ABORTED });
    const taskRepo = await this.getTaskRepository();
    await taskRepo.abortJobTasks(req.jobId);
  }

  private async getTaskRepository(): Promise<TaskRepository> {
    if (!this.taskRepository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.taskRepository = this.connectionManager.getTaskRepository();
    }
    return this.taskRepository;
  }

  private async getJobRepository(): Promise<JobRepository> {
    if (!this.jobRepository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.jobRepository = this.connectionManager.getJobRepository();
    }
    return this.jobRepository;
  }
}
