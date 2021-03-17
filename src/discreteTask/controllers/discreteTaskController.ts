import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { DeleteResult } from 'typeorm';
import { Services } from '../../common/constants';
import { BadRequestError } from '../../common/errors';
import {
  IDiscreteTaskRequest,
  IDiscreteTaskResponse,
  IDiscreteTaskCreate,
  ILogger,
  IDiscreteTaskStatusUpdate,
  IStatusInfo,
  IDiscreteTaskQuery,
} from '../../common/interfaces';
import { DiscreteTaskManager } from '../models/discreteTaskManager';

type CreateResourceHandler = RequestHandler<{ id: string; version: string }, string[], IDiscreteTaskRequest>;
type GetResourcesHandler = RequestHandler<undefined, IDiscreteTaskResponse[], undefined, IDiscreteTaskQuery>;
type GetResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse>;
type DeleteResourceHandler = RequestHandler<{ id: string; version: string }, DeleteResult>;
type UpdateResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse, IStatusInfo>;

@injectable()
export class DiscreteTaskController {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(DiscreteTaskManager) private readonly manager: DiscreteTaskManager
  ) {}

  public createResource: CreateResourceHandler = async (req, res, next) => {
    try {
      const discreteCreate: IDiscreteTaskCreate = {
        id: req.params.id,
        version: req.params.version,
        metadata: req.body.metadata,
        tasks: req.body.tasks,
      };
      const taskIds = await this.manager.createResource(discreteCreate);
      return res.status(httpStatus.CREATED).json(taskIds);
    } catch (err) {
      return next(err);
    }
  };

  public getAllResources: GetResourcesHandler = async (req, res, next) => {
    try {
      const queryBy = req.query;
      const discreteTasks = await this.manager.getAllDiscreteTasks(queryBy);
      return res.status(httpStatus.OK).json(discreteTasks);
    } catch (err) {
      return next(err);
    }
  };

  public getResource: GetResourceHandler = async (req, res, next) => {
    try {
      const discreteTask = await this.manager.getDiscreteTask(req.params);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      if (Object.keys(req.body).length === 0) {
        throw new BadRequestError('Could not update discrete task. No data supplied in request body');
      }

      const discreteUpdate: IDiscreteTaskStatusUpdate = {
        id: req.params.id,
        version: req.params.version,
        status: req.body.status,
        reason: req.body.reason,
        isCleaned: req.body.isCleaned,
      };
      const discreteTask = await this.manager.updateDiscreteTask(discreteUpdate);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      const discreteTask = await this.manager.deleteDiscreteTask(req.params);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };
}
