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
    try {
      this.logger.log('debug', `Attempting to create discrete task, body: ${JSON.stringify(req.body)}, params: ${JSON.stringify(req.params)}`);
      const discreteCreate: IDiscreteTaskCreate = {
        id: req.params.id,
        version: req.params.version,
        metadata: req.body.metadata,
        tasks: req.body.tasks,
      };
      this.logger.log('debug', `Discrete create: ${JSON.stringify(discreteCreate)}`);
      const discreteTask: IDiscreteTaskResponse = await this.manager.createResource(discreteCreate);
      this.logger.log('debug', 'Created discrete task');
      return res.status(httpStatus.CREATED).json(discreteTask);
    } catch (err) {
      this.logger.log('error', 'Failed creating discrete task');
      return next(err);
    }
  };

  public getAllResources: GetResourcesHandler = async (req, res, next) => {
    this.logger.log('info', 'Got request for discrete tasks');
    try {
      const discreteTasks = await this.manager.getAllDiscreteTasks();
      return res.status(httpStatus.OK).json(discreteTasks);
    } catch (err) {
      return next(err);
    }
  };

  public getResource: GetResourceHandler = async (req, res, next) => {
    this.logger.log('info', `Got request for discrete task ${req.params.id}`);
    try {
      const discreteTask = await this.manager.getDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    this.logger.log('info', `Got request for discrete task ${req.params.id}`);
    try {
      const discreteTask = await this.manager.updateDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    this.logger.log('info', `Got request to delete discrete task ${req.params.id}`);
    try {
      const discreteTask = await this.manager.deleteDiscreteTask(req.body);
      return res.status(httpStatus.OK).json(discreteTask);
    } catch (err) {
      return next(err);
    }
  };
}
