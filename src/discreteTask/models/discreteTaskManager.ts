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

  public async createResource(resource: IDiscreteTaskCreate): Promise<void> {
    const repository = await this.getRepository();

    this.logger.log('info', `Creating discrete task, id: ${resource.id}, version: ${resource.version}`);
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

    this.logger.log('info', `Created discrete task, id: ${resource.id}, version: ${resource.version}`);
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
    // Check if discrete task exists
    if (!record) {
      throw new Error('Discrete task does not exist');
    }

    const model = this.entityToModel(record);
    return model;
  }

  public async updateDiscreteTask(params: IDiscreteTaskStatusUpdate): Promise<IDiscreteTaskResponse> {
    const repository = await this.getRepository();
    const discrete: IDiscreteTaskParams = {
      id: params.id,
      version: params.version,
    };
    const exists = await repository.exists(discrete);
    // Check if discrete already exists
    if (!exists) {
      return Promise.reject();
    }

    this.logger.log('info', `Updating discrete task, params: ${JSON.stringify(params)}`);
    // Update discrete task
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

    // Check if discrete exists
    const discrete = await repository.get(params);
    if (!discrete) {
      return Promise.reject();
    }

    // Get all partial tasks for given discrete
    const tasks = await taskManager.getPartialTasksByDiscrete(discrete, SearchOrder.DESC);

    // Delete partial tasks
    for (const task of tasks) {
      this.logger.log('info', `Deleting partial task with id "${task.id}" from discrete task with id ${discrete.id} and version ${discrete.version}`);
      await taskManager.deleteResource(task);
    }

    // Delete discrete
    const deleteResult = await repository.deleteDiscreteTask(params);
    return deleteResult;
  }

  public async exists(params: IDiscreteTaskParams): Promise<boolean> {
    const repository = await this.getRepository();
    return await repository.exists(params);
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

  /**
   * Convert discrete entity to discrete response
   * @param entity Discrete entity
   */
  private entityToModel(entity: DiscreteTaskEntity): IDiscreteTaskResponse {
    // Convert partial tasks related to discrete (if has any)
    const tasks = entity.tasks ?? [];
    const taskResponses: IPartialTaskResponse[] = tasks.map((task) => convertTaskEntityToResponse(task));
    const discreteTask: IDiscreteTaskResponse = {
      id: entity.id,
      version: entity.version,
      tasks: taskResponses,
      metadata: entity.metadata,
      updateDate: entity.updateDate,
      status: entity.status,
      reason: entity.reason,
    };

    return discreteTask;
  }
}
