import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { DeleteResult } from 'typeorm';
import { Services } from '../../common/constants';
import { IDiscreteTaskRequest, IDiscreteTaskResponse, IDiscreteTaskCreate, ILogger } from '../../common/interfaces';
import { DiscreteTaskManager } from '../models/discreteTaskManager';

type CreateResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse, IDiscreteTaskRequest>;
type GetResourcesHandler = RequestHandler<undefined, IDiscreteTaskResponse[]>;
type GetResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse>;
type DeleteResourceHandler = RequestHandler<{ id: string; version: string }, DeleteResult>;
type UpdateResourceHandler = RequestHandler<{ id: string; version: string }, IDiscreteTaskResponse>;

@injectable()
export class DiscreteTaskController {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(DiscreteTaskManager) private readonly manager: DiscreteTaskManager
  ) {}

  public createResource: CreateResourceHandler = async (req, res, next) => {
    const discreteCreate: IDiscreteTaskCreate = {
      id: req.params.id,
      version: req.params.version,
      metadata: req.body.metadata,
      tasks: req.body.tasks,
    };
    try {
      this.logger.log('info', `Creating discrete task, id: ${discreteCreate.id}, version: ${discreteCreate.version}`);
      const discreteTask: IDiscreteTaskResponse = await this.manager.createResource(discreteCreate);
      return res.status(httpStatus.CREATED).json(discreteTask);
    } catch (err) {
      this.logger.log('error', `Failed to create discrete task id: ${discreteCreate.id}, version: ${discreteCreate.version}`);
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
      const discreteTask = await this.manager.getDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      this.logger.log(
        'info',
        `Got request to update discrete task id: ${req.params.id}, version: ${req.params.version}, with the following info: ${JSON.stringify(
          req.body
        )}`
      );
      const discreteTask = await this.manager.updateDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      this.logger.log('info', `Got request to delete discrete task id: ${req.params.id}, version: ${req.params.version}`);
      const discreteTask = await this.manager.deleteDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };
}
