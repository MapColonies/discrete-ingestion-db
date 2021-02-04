import { DeleteResult } from 'typeorm';
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
import { PartialTaskManager } from '../../partialTask/models/partialTaskManager';

@injectable()
export class DiscreteTaskManager {
  private repository?: DiscreteTaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async createResource(resource: IDiscreteTaskCreate): Promise<IDiscreteTaskResponse> {
    const repository = await this.getRepository();
    const record = await repository.createDiscreteTask(resource);

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
    const repository = await this.getRepository();
    const records = await repository.getAll(SearchOrder.DESC);

    if (!records) {
      return Promise.reject();
    }

    const models = records.map((record) => this.entityToModel(record));
    return models;
  }

  public async getDiscreteTask(params: IDiscreteTaskParams): Promise<IDiscreteTaskResponse> {
    const repository = await this.getRepository();
    const record = await repository.get(params);

    if (!record) {
      throw new Error('Discrete task does not exist');
    }

    const model = this.entityToModel(record);
    return model;
  }

  public async updateDiscreteTask(params: IDiscreteTaskStatusUpdate): Promise<IDiscreteTaskResponse> {
    const repository = await this.getRepository();
    const exists = await repository.exists(params);

    // Check if discrete already exists
    if (!exists) {
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
    const repository = await this.getRepository();

    const taskManager = new PartialTaskManager(this.logger, this.connectionManager);
    const discrete = await repository.get(params);
    if (!discrete) {
      return Promise.reject();
    }
    const tasks = await taskManager.getPartialTasksByDiscrete(discrete, SearchOrder.DESC);

    // tasks.forEach(async (task) => await taskManager.deleteResource(task));
    for (const task of tasks) {
      await taskManager.deleteResource(task);
    }

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
    const tasks: IPartialTaskResponse[] = entity.tasks.map((task) => convertTaskEntityToResponse(task));
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
