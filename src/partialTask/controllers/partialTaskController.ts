import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SearchOrder, Services } from '../../common/constants';
import { BadRequestError } from '../../common/errors';
import {
  IDiscreteTaskParams,
  ILogger,
  IPartialTaskParams,
  IPartialTaskResponse,
  IPartialTasksStatuses,
  IPartialTaskStatusUpdate,
  ITaskStatusInfo,
} from '../../common/interfaces';
import { PartialTaskManager } from '../models/partialTaskManager';

type GetTaskHandler = RequestHandler<{ taskId: string }, IPartialTaskResponse, undefined>;
type UpdateResourceHandler = RequestHandler<{ taskId: string }, IPartialTaskResponse, ITaskStatusInfo>;
type GetTasksHandler = RequestHandler<{ discreteId: string; version: string }, IPartialTaskResponse[]>;
type GetTasksStatusHandler = RequestHandler<{ discreteId: string; version: string }, IPartialTasksStatuses>;

@injectable()
export class PartialTaskController {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(PartialTaskManager) private readonly manager: PartialTaskManager
  ) {}

  public getPartialTaskById: GetTaskHandler = async (req, res, next) => {
    try {
      const taskParams: IPartialTaskParams = {
        id: req.params.taskId,
      };
      const partialTask: IPartialTaskResponse = await this.manager.getPartialTask(taskParams);
      return res.status(httpStatus.OK).json(partialTask);
    } catch (err) {
      this.logger.log('error', `Failed getting patial task, id: ${req.params.taskId}, error: ${JSON.stringify(err)}`);
      return next(err);
    }
  };

  public getAllByDiscrete: GetTasksHandler = async (req, res, next) => {
    try {
      const discreteParams: IDiscreteTaskParams = {
        id: req.params.discreteId,
        version: req.params.version,
      };

      const partialTasks: IPartialTaskResponse[] = await this.manager.getPartialTasksByDiscrete(discreteParams, SearchOrder.DESC);
      return res.status(httpStatus.OK).json(partialTasks);
    } catch (err) {
      this.logger.log(
        'error',
        `Failed getting all patial tasks by discrete, id: ${req.params.discreteId}, version: ${JSON.stringify(
          req.params.version
        )}, error: ${JSON.stringify(err)}`
      );
      return next(err);
    }
  };

  public getStatusesByDiscrete: GetTasksStatusHandler = async (req, res, next) => {
    try {
      const discreteParams: IDiscreteTaskParams = {
        id: req.params.discreteId,
        version: req.params.version,
      };

      const partialTasks: IPartialTasksStatuses = await this.manager.getPartialTaskStatusesByDiscrete(discreteParams);
      return res.status(httpStatus.OK).json(partialTasks);
    } catch (err) {
      this.logger.log(
        'error',
        `Failed getting patial task statuses by discrete, id: ${req.params.discreteId}, version: ${JSON.stringify(
          req.params.version
        )}, error: ${JSON.stringify(err)}`
      );
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      if (Object.keys(req.body).length === 0) {
        throw new BadRequestError('Could not update partial task. No data supplied in request body');
      }

      const task: IPartialTaskStatusUpdate = {
        id: req.params.taskId,
        ...req.body,
      };
      const partialTask: IPartialTaskResponse = await this.manager.updatePartialTask(task);
      return res.status(httpStatus.OK).json(partialTask);
    } catch (err) {
      this.logger.log('error', `Failed updateing patial task, id: ${req.params.taskId}, error: ${JSON.stringify(err)}`);
      return next(err);
    }
  };
}
