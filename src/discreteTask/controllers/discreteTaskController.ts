import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { DeleteResult } from 'typeorm';
import { Services } from '../../common/constants';
import {
  IDiscreteTaskRequest,
  IDiscreteTaskResponse,
  IDiscreteTaskCreate,
  ILogger,
  IDiscreteTaskStatusUpdate,
  IStatusInfo,
} from '../../common/interfaces';
import { DiscreteTaskManager } from '../models/discreteTaskManager';

type CreateResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse, IDiscreteTaskRequest>;
type GetResourcesHandler = RequestHandler<undefined, IDiscreteTaskResponse[]>;
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
      const discreteTask: IDiscreteTaskResponse = await this.manager.createResource(discreteCreate);
      return res.status(httpStatus.CREATED).json(discreteTask);
    } catch (err) {
      this.logger.log('error', `Failed to create discrete task id: ${req.params.id}, version: ${req.params.version}`);
      return next(err);
    }
  };

  public getAllResources: GetResourcesHandler = async (req, res, next) => {
    try {
      const discreteTasks = await this.manager.getAllDiscreteTasks();
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
      const discreteUpdate: IDiscreteTaskStatusUpdate = {
        id: req.params.id,
        version: req.params.version,
        status: req.body.status,
        reason: req.body.reason,
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
