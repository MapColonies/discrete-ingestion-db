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
  private repository: JobRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {
    this.getRepository()
      .then((repo) => {
        this.repository = repo;
      })
      .catch((err) => {
        throw err;
      });
  }

  public async findJobs(req: IFindJobsRequest): Promise<IHttpResponse<FindJobsResponse | string>> {
    const res = await this.repository.findJobs(req);
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
    this.logger.log('info', 'creating job');
    const res = await this.repository.createJob(req);
    return res;
  }

  public async getJob(req: IJobsParams): Promise<IGetJobResponse> {
    const res = await this.repository.getJob(req.jobId);
    if (res === undefined) {
      throw new EntityNotFound('Job not found');
    }
    return res;
  }

  public async updateJob(req: IUpdateJobRequest): Promise<void> {
    this.logger.log('info', `updating job ${req.jobId}`);
    await this.repository.updateJob(req);
  }

  public async deleteJob(req: IJobsParams): Promise<void> {
    this.logger.log('info', `deleting job ${req.jobId}`);
    const res = await this.repository.deleteJob(req.jobId);
    return res;
  }

  private async getRepository(): Promise<JobRepository> {
    if (!this.connectionManager.isConnected()) {
      await this.connectionManager.init();
    }
    this.repository = this.connectionManager.getJobRepository();
    return this.repository;
  }
}
