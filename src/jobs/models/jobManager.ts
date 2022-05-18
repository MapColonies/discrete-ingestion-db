import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import {
  FindJobsResponse,
  ICreateJobBody,
  ICreateJobResponse,
  IGetJobResponse,
  IFindJobsRequest,
  IJobsParams,
  IUpdateJobRequest,
  IJobsQuery,
  IIsResettableResponse,
  IResetJobRequest,
} from '../../common/dataModels/jobs';
import { JobRepository } from '../../DAL/repositories/jobRepository';
import { EntityNotFound } from '../../common/errors';
import { TransactionActions } from '../../DAL/repositories/transactionActions';

@injectable()
export class JobManager {
  private repository?: JobRepository;

  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    private readonly connectionManager: ConnectionManager,
    private readonly transactionManager: TransactionActions
  ) {}

  public async findJobs(req: IFindJobsRequest): Promise<FindJobsResponse> {
    const repo = await this.getRepository();
    const res = await repo.findJobs(req);
    return res;
  }

  public async createJob(req: ICreateJobBody): Promise<ICreateJobResponse> {
    const repo = await this.getRepository();
    this.logger.log('info', 'creating job');
    const res = await repo.createJob(req);
    return res;
  }

  public async getJob(req: IJobsParams, query: IJobsQuery): Promise<IGetJobResponse> {
    const repo = await this.getRepository();
    const res = await repo.getJob(req.jobId, query.shouldReturnTasks);
    if (res === undefined) {
      throw new EntityNotFound('Job not found');
    }
    return res;
  }

  public async updateJob(req: IUpdateJobRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `updating job ${req.jobId}`);
    await repo.updateJob(req);
  }

  public async deleteJob(req: IJobsParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `deleting job ${req.jobId}`);
    const res = await repo.deleteJob(req.jobId);
    return res;
  }

  public async isResettable(req: IJobsParams): Promise<IIsResettableResponse> {
    const jobId = req.jobId;
    const repo = await this.getRepository();
    const isResettable = await repo.isJobResettable(jobId);
    return { jobId, isResettable };
  }

  public async resetJob(req: IResetJobRequest): Promise<void> {
    const jobId = req.jobId;
    const newExpirationDate = req.newExpirationDate;
    this.logger.log('info', `reset job ${req.jobId}, newExpirationDate ${(newExpirationDate ?? 'undefiend') as string}`);
    await this.transactionManager.resetJob(jobId, newExpirationDate);
  }

  private async getRepository(): Promise<JobRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getJobRepository();
    }
    return this.repository;
  }
}
