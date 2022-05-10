import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { singleton, inject } from 'tsyringe';
import { ErrorResponse } from '@map-colonies/error-express-handler';
import { ResponseCodes, Services } from '../../common/constants';
import { IFindInactiveTasksRequest, IGetTaskResponse, IRetrieveAndStartRequest } from '../../common/dataModels/tasks';
import { DefaultResponse, ILogger } from '../../common/interfaces';
import { TaskManagementManager } from '../models/taskManagementManger';
import { EntityNotFound } from '../../common/errors';
import { IJobsParams } from '../../common/dataModels/jobs';

type RetrieveAndStartHandler = RequestHandler<IRetrieveAndStartRequest, IGetTaskResponse | ErrorResponse>;
type ReleaseInactiveTasksHandler = RequestHandler<undefined, string[], string[]>;
type FindInactiveTasksHandler = RequestHandler<undefined, string[], IFindInactiveTasksRequest>;
type UpdateExpiredStatusHandler = RequestHandler<undefined, DefaultResponse>;
type AbortHandler = RequestHandler<IJobsParams, DefaultResponse>;

@singleton()
export class TaskManagementController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly manager: TaskManagementManager) {}

  public startPending: RetrieveAndStartHandler = async (req, res, next) => {
    try {
      const task = await this.manager.retrieveAndStart(req.params);
      return res.status(httpStatus.OK).json(task);
    } catch (err) {
      if (err instanceof EntityNotFound) {
        res.status(httpStatus.NOT_FOUND).json({ message: err.message });
        return;
      }
      return next(err);
    }
  };

  public releaseInactive: ReleaseInactiveTasksHandler = async (req, res, next) => {
    try {
      const releasedIds = await this.manager.releaseInactive(req.body);
      return res.status(httpStatus.OK).json(releasedIds);
    } catch (err) {
      return next(err);
    }
  };

  public findInactiveTasks: FindInactiveTasksHandler = async (req, res, next) => {
    try {
      const inactiveTasksIds = await this.manager.getInactiveTasks(req.body);
      return res.status(httpStatus.OK).json(inactiveTasksIds);
    } catch (err) {
      return next(err);
    }
  };

  public updateExpiredStatus: UpdateExpiredStatusHandler = async (req, res, next) => {
    try {
      await this.manager.updateExpiredJobsAndTasks();
      res.status(httpStatus.OK).json({ code: ResponseCodes.UPDATE_EXPIRED_STATUS });
    } catch (err) {
      return next(err);
    }
  };

  public abort: AbortHandler = async (req, res, next) => {
    try {
      await this.manager.abortJobAndTasks(req.params);
      return res.status(httpStatus.OK).json({ code: ResponseCodes.JOB_ABORTED });
    } catch (err) {
      return next(err);
    }
  };
}
