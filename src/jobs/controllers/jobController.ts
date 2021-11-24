import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { singleton, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import {
  FindJobsResponse,
  ICreateJobBody,
  ICreateJobResponse,
  IFindJobsRequest,
  IGetJobResponse,
  IIsResettableResponse,
  IJobsParams,
  IJobsQuery,
  IUpdateJobBody,
  IUpdateJobRequest,
} from '../../common/dataModels/jobs';
import { ILogger } from '../../common/interfaces';
import { JobManager } from '../models/jobManager';

type CreateResourceHandler = RequestHandler<undefined, ICreateJobResponse, ICreateJobBody>;
type FindResourceHandler = RequestHandler<undefined, FindJobsResponse | string, undefined, IFindJobsRequest>;
type GetResourceHandler = RequestHandler<IJobsParams, IGetJobResponse, undefined, IJobsQuery>;
type DeleteResourceHandler = RequestHandler<IJobsParams, string>;
type UpdateResourceHandler = RequestHandler<IJobsParams, string, IUpdateJobBody>;
type IsResettableHandler = RequestHandler<IJobsParams, IIsResettableResponse>;
type ResetJobHandler = RequestHandler<IJobsParams, string>;

@singleton()
export class JobController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly manager: JobManager) {}

  public createResource: CreateResourceHandler = async (req, res, next) => {
    try {
      const job = await this.manager.createJob(req.body);
      return res.status(httpStatus.CREATED).json(job);
    } catch (err) {
      return next(err);
    }
  };

  public findResource: FindResourceHandler = async (req, res, next) => {
    try {
      const jobsRes = await this.manager.findJobs(req.query);
      return res.status(jobsRes.status).json(jobsRes.body);
    } catch (err) {
      return next(err);
    }
  };

  public getResource: GetResourceHandler = async (req, res, next) => {
    try {
      const job = await this.manager.getJob(req.params, req.query);
      return res.status(httpStatus.OK).json(job);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      const jobUpdateReq: IUpdateJobRequest = { ...req.body, ...req.params };
      await this.manager.updateJob(jobUpdateReq);
      return res.status(httpStatus.OK).send('Job updated successfully');
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      await this.manager.deleteJob(req.params);
      return res.status(httpStatus.OK).send('Job deleted successfully');
    } catch (err) {
      return next(err);
    }
  };

  public isResettable: IsResettableHandler = async (req, res, next) => {
    try {
      const resettable = await this.manager.isResettable(req.params);
      return res.status(httpStatus.OK).send(resettable);
    } catch (err) {
      return next(err);
    }
  };

  public resetJob: ResetJobHandler = async (req, res, next) => {
    try {
      await this.manager.resetJob(req.params);
      return res.status(httpStatus.OK).send('Job has been reset');
    } catch (err) {
      return next(err);
    }
  };
}
