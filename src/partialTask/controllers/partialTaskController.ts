import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SearchOrder, Services } from '../../common/constants';
import { IDiscreteTaskParams, ILogger, IPartialTaskResponse, IPartialTaskStatusUpdate, IStatusInfo } from '../../common/interfaces';
import { DiscreteTaskRepository } from '../../DAL/repositories/discreteTaskRepository';
import { PartialTaskManager } from '../models/partialTaskManager';

type UpdateResourceHandler = RequestHandler<{ taskId: string }, IPartialTaskResponse, IStatusInfo>;
type GetTasksHandler = RequestHandler<{ discreteId: string; version: string }, IPartialTaskResponse[]>;

@injectable()
export class PartialTaskController {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(PartialTaskManager) private readonly manager: PartialTaskManager
  ) {}

  public getAllByDiscrete: GetTasksHandler = async (req, res, next) => {
    try {
      const discreteRepository = new DiscreteTaskRepository();
      const discreteParams: IDiscreteTaskParams = {
        id: req.params.discreteId,
        version: req.params.version,
      };
      const discrete = await discreteRepository.get(discreteParams);

      if (!discrete) {
        // TODO: throw custom error
        throw new Error('No such discrete');
      }

      const partialTask: IPartialTaskResponse[] = await this.manager.getPartialTasksByDiscrete(discrete, SearchOrder.DESC);
      return res.status(httpStatus.CREATED).json(partialTask);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      this.logger.log('info', `Got request to update partial task, id: ${req.params.taskId}`);
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
