import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import {
  GetTasksResponse,
  IAllTasksParams,
  CreateTasksResponse,
  IGetTaskResponse,
  ISpecificTaskParams,
  IUpdateTaskBody,
  IUpdateTaskRequest,
  CreateTasksBody,
  CreateTasksRequest,
} from '../../common/dataModels/tasks';
import { ILogger } from '../../common/interfaces';
import { TaskManager } from '../models/taskManager';

type CreateResourceHandler = RequestHandler<IAllTasksParams, CreateTasksResponse, CreateTasksBody>;
type GetResourcesHandler = RequestHandler<IAllTasksParams, GetTasksResponse | string>;
type GetResourceHandler = RequestHandler<ISpecificTaskParams, IGetTaskResponse>;
type DeleteResourceHandler = RequestHandler<ISpecificTaskParams, string>;
type UpdateResourceHandler = RequestHandler<ISpecificTaskParams, string, IUpdateTaskBody>;

@injectable()
export class TaskController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly manager: TaskManager) {}

  public createResource: CreateResourceHandler = async (req, res, next) => {
    try {
      let tasksReq: CreateTasksRequest;
      if (Array.isArray(req.body)) {
        tasksReq = req.body.map((createBody) => {
          return { ...createBody, ...req.params };
        });
      } else {
        tasksReq = { ...req.body, ...req.params };
      }
      const task = await this.manager.createTask(tasksReq);
      return res.status(httpStatus.CREATED).json(task);
    } catch (err) {
      return next(err);
    }
  };

  public getResources: GetResourcesHandler = async (req, res, next) => {
    try {
      const tasksRes = await this.manager.getAllTasks(req.params);
      return res.status(tasksRes.status).json(tasksRes.body);
    } catch (err) {
      return next(err);
    }
  };

  public getResource: GetResourceHandler = async (req, res, next) => {
    try {
      const job = await this.manager.getTask(req.params);
      return res.status(httpStatus.OK).json(job);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      const taskUpdateReq: IUpdateTaskRequest = { ...req.body, ...req.params };
      await this.manager.updateTask(taskUpdateReq);
      return res.status(httpStatus.OK).send('Update task data');
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      await this.manager.deleteTask(req.params);
      return res.status(httpStatus.OK).send('task deleted successfully');
    } catch (err) {
      return next(err);
    }
  };
}
