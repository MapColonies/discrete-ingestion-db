import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SearchOrder, Services } from '../../common/constants';
import {
  IDiscreteTaskParams,
  ILogger,
  IPartialTaskParams,
  IPartialTaskResponse,
  IPartialTaskStatusUpdate,
  IStatusInfo,
} from '../../common/interfaces';
import { PartialTaskManager } from '../models/partialTaskManager';

type GetTaskHandler = RequestHandler<{ taskId: string }, IPartialTaskResponse, undefined>;
type UpdateResourceHandler = RequestHandler<{ taskId: string }, IPartialTaskResponse, IStatusInfo>;
type GetTasksHandler = RequestHandler<{ discreteId: string; version: string }, IPartialTaskResponse[]>;

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
      return res.status(httpStatus.CREATED).json(partialTask);
    } catch (err) {
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
      return res.status(httpStatus.CREATED).json(partialTasks);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      const task: IPartialTaskStatusUpdate = {
        id: req.params.taskId,
        ...req.body,
      };
      const partialTask: IPartialTaskResponse = await this.manager.updatePartialTask(task);
      return res.status(httpStatus.CREATED).json(partialTask);
    } catch (err) {
      return next(err);
    }
  };
}
