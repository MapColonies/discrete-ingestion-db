import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import convertTaskEntityToResponse from '../../common/utils/convertTaskEntityToResponse';
import {
  IDiscreteTaskCreate,
  IDiscreteTaskParams,
  IDiscreteTaskResponse,
  IDiscreteTaskStatusUpdate,
  ILogger,
  IPartialTaskCreate,
  IPartialTaskResponse,
} from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { DiscreteTaskEntity } from '../../DAL/entity/discreteTask';
import { DiscreteTaskRepository } from '../../DAL/repositories/discreteTaskRepository';
import { SearchOrder } from '../../common/constants';
import { DeleteResult } from 'typeorm';
import { PartialTaskManager } from '../../partialTask/models/partialTaskManager';
import { PartialTaskRepository } from '../../DAL/repositories/partialTaskRepository';
import { PartialTaskEntity } from '../../DAL/entity/partialTask';
import { PartialTaskController } from '../../partialTask/controllers/partialTaskController';

@injectable()
export class DiscreteTaskManager {
  private repository: DiscreteTaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async createResource(resource: IDiscreteTaskCreate): Promise<IDiscreteTaskResponse> {
    this.logger.log('info', 'logging');
    this.logger.log('debug', `Resource 111: ${JSON.stringify(resource)}`);
    const repository = await this.getRepository();
    const record = await repository.createDiscreteTask(resource);

    this.logger.log('debug', `Record: ${JSON.stringify(record)}`);

    if (!record) {
      return Promise.reject();
    }

    const taskManager = new PartialTaskManager(this.logger, this.connectionManager);
    for (const task of resource.tasks) {
      const taskCreate: IPartialTaskCreate = {
        discrete: record,
        ...task,
      };
      await taskManager.createResource(taskCreate);
    }

    const model = this.entityToModel(record);
    return model;
  }

  public async getAllDiscreteTasks(): Promise<IDiscreteTaskResponse[]> {
    this.logger.log('info', 'logging');
    const repository = await this.getRepository();
    const records = await repository.getAll(SearchOrder.DESC);

    if (!records) {
      return Promise.reject();
    }

    const models = records.map((record) => this.entityToModel(record));
    return models;
  }

  public async getDiscreteTask(params: IDiscreteTaskParams): Promise<IDiscreteTaskResponse> {
    this.logger.log('info', 'logging');
    const repository = await this.getRepository();
    const record = await repository.get(params);

    if (!record) {
      return Promise.reject();
    }

    const model = this.entityToModel(record);
    return model;
  }

  public async updateDiscreteTask(params: IDiscreteTaskStatusUpdate): Promise<IDiscreteTaskResponse> {
    this.logger.log('info', 'logging');
    const repository = await this.getRepository();
    const discrete = await this.getDiscreteTask(params);

    // Check if discrete already exists
    if (!discrete) {
      return Promise.reject();
    }

    const record = await repository.updateDiscreteTask(params);

    if (!record) {
      return Promise.reject();
    }

    const model = this.entityToModel(record);
    return model;
  }

  public async deleteDiscreteTask(params: IDiscreteTaskParams): Promise<DeleteResult> {
    this.logger.log('info', 'logging');
    const repository = await this.getRepository();

    const taskManager = new PartialTaskManager(this.logger, this.connectionManager);
    const discrete = await repository.get(params);
    if (!discrete) {
      return Promise.reject();
    }
    this.logger.log('info', 'logging1');
    const tasks = await taskManager.getPartialTasksByDiscrete(discrete, SearchOrder.DESC);
    this.logger.log('debug', `Tasks: ${JSON.stringify(tasks)}`);
    if (!tasks) {
      return Promise.reject();
    }
    // tasks.forEach(async (task) => await taskManager.deleteResource(task));
    for (const task of tasks) {
      await taskManager.deleteResource(task);
    }

    this.logger.log('info', 'logging2');
    const deleteResult = await repository.deleteDiscreteTask(params);
    return deleteResult;
  }

  private async getRepository(): Promise<DiscreteTaskRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getDiscreteTaskRepository();
    }
    return this.repository;
  }

  private entityToModel(entity: DiscreteTaskEntity): IDiscreteTaskResponse {
    const tasks: IPartialTaskResponse[] = entity.tasks ? entity.tasks.map((task) => convertTaskEntityToResponse(task)) : [];
    const discreteTask: IDiscreteTaskResponse = {
      id: entity.id,
      version: entity.version,
      tasks: tasks,
      metadata: entity.metadata,
      updateDate: entity.updateDate,
      status: entity.status,
      reason: entity.reason,
    };

    return discreteTask;
  }
}
