import { inject, injectable } from 'tsyringe';
import httpStatus from 'http-status-codes';
import { Services } from '../../common/constants';
import { IHttpResponse, ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import {
  FindJobsResponse,
  ICreateJobBody,
  ICreateJobResponse,
  IGetJobResponse,
  IFindJobsRequest,
  IJobsParams,
  IUpdateJobRequest,
} from '../../common/dataModels/jobs';
import { JobRepository } from '../../DAL/repositories/jobRepository';
import { EntityNotFound } from '../../common/errors';

@injectable()
export class JobManager {
  private repository?: JobRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async findJobs(req: IFindJobsRequest): Promise<IHttpResponse<FindJobsResponse | string>> {
    const repo = await this.getRepository();
    const res = await repo.findJobs(req);
    if (res.length === 0) {
      return {
        body: 'No jobs',
        status: httpStatus.NO_CONTENT,
      };
    }
    return {
      body: res,
      status: httpStatus.OK,
    };
  }

  public async createJob(req: ICreateJobBody): Promise<ICreateJobResponse> {
    const repo = await this.getRepository();
    this.logger.log('info', 'creating job');
    const res = await repo.createJob(req);
    return res;
  }

  public async getJob(req: IJobsParams): Promise<IGetJobResponse> {
    const repo = await this.getRepository();
    const res = await repo.getJob(req.jobId);
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
