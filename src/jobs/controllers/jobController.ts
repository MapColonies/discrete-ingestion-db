import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { singleton, inject } from 'tsyringe';
import { ResponseCodes, Services } from '../../common/constants';
import {
  FindJobsResponse,
  ICreateJobBody,
  ICreateJobResponse,
  IFindJobsRequest,
  IGetJobResponse,
  IIsResettableResponse,
  IJobsParams,
  IJobsQuery,
  IResetJobRequest,
  IUpdateJobBody,
  IUpdateJobRequest,
} from '../../common/dataModels/jobs';
import { DefaultResponse, ILogger } from '../../common/interfaces';
import { JobManager } from '../models/jobManager';

type CreateResourceHandler = RequestHandler<undefined, ICreateJobResponse, ICreateJobBody>;
type FindResourceHandler = RequestHandler<undefined, FindJobsResponse, undefined, IFindJobsRequest>;
type GetResourceHandler = RequestHandler<IJobsParams, IGetJobResponse, undefined, IJobsQuery>;
type DeleteResourceHandler = RequestHandler<IJobsParams, DefaultResponse>;
type UpdateResourceHandler = RequestHandler<IJobsParams, DefaultResponse, IUpdateJobBody>;
type IsResettableHandler = RequestHandler<IJobsParams, IIsResettableResponse>;
type ResetJobHandler = RequestHandler<IJobsParams, DefaultResponse, IResetJobRequest>;

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
      return res.status(httpStatus.OK).json(jobsRes);
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
      return res.status(httpStatus.OK).json({ code: ResponseCodes.JOB_UPDATED });
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      await this.manager.deleteJob(req.params);
      return res.status(httpStatus.OK).json({ code: ResponseCodes.JOB_DELETED });
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
      const jobUpdateReq: IResetJobRequest = { ...req.body, ...req.params };
      await this.manager.resetJob(jobUpdateReq);
      return res.status(httpStatus.OK).json({ code: ResponseCodes.JOB_RESET });
    } catch (err) {
      return next(err);
    }
  };
}
