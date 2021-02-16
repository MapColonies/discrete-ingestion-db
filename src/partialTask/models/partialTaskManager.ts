import { DeleteResult } from 'typeorm';
import { inject, injectable } from 'tsyringe';
import { SearchOrder, Services } from '../../common/constants';
import convertTaskEntityToResponse from '../../common/utils/convertTaskEntityToResponse';
import convertTaskStatusesToResponse from '../../common/utils/convertTaskStatusesToResponse';
import {
  IDiscreteTaskParams,
  ILogger,
  IPartialTaskCreate,
  IPartialTaskParams,
  IPartialTaskResponse,
  IPartialTasksStatuses,
  IPartialTaskStatusUpdate,
} from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { PartialTaskRepository } from '../../DAL/repositories/partialTaskRepository';
import { DiscreteTaskManager } from '../../discreteTask/models/discreteTaskManager';
import { EntityAlreadyExists, EntityCreationError, EntityGetError, EntityNotFound, EntityUpdateError } from '../../common/errors';

@injectable()
export class PartialTaskManager {
  private repository?: PartialTaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async getPartialTask(params: IPartialTaskParams): Promise<IPartialTaskResponse> {
    const repository = await this.getRepository();

    const exists = await repository.exists(params);
    // Check if discrete already exists
    if (!exists) {
      throw new EntityNotFound('Partial task does not exist');
    }

    const record = await repository.get(params);
    if (!record) {
      throw new EntityNotFound('Failed to get partial task');
    }

    const model = convertTaskEntityToResponse(record);
    return model;
  }

  public async getPartialTasksByDiscrete(discreteParams: IDiscreteTaskParams, order: SearchOrder): Promise<IPartialTaskResponse[]> {
    const repository = await this.getRepository();

    const discreteManager = new DiscreteTaskManager(this.logger, this.connectionManager);
    const exists = await discreteManager.exists(discreteParams);

    if (!exists) {
      throw new EntityNotFound('Discrete task does not exist');
    }

    const records = await repository.getAll(discreteParams, order);
    if (!records) {
      throw new EntityGetError('Failed to get all partial tasks by discrete');
    }

    const model = records.map((task) => convertTaskEntityToResponse(task));
    return model;
  }

  public async getPartialTaskStatusesByDiscrete(discreteParams: IDiscreteTaskParams): Promise<IPartialTasksStatuses> {
    const repository = await this.getRepository();

    const discreteManager = new DiscreteTaskManager(this.logger, this.connectionManager);
    const exists = await discreteManager.exists(discreteParams);

    if (!exists) {
      throw new EntityNotFound('Discrete task does not exist');
    }

    const records = await repository.getAllStatuses(discreteParams);
    if (!records) {
      throw new EntityGetError('Failed to get all partial task statuses summary by discrete');
    }

    const model = convertTaskStatusesToResponse(records);
    return model;
  }

  public async updatePartialTask(params: IPartialTaskStatusUpdate): Promise<IPartialTaskResponse> {
    const repository = await this.getRepository();
    const task: IPartialTaskParams = {
      id: params.id,
    };

    const exists = await repository.exists(task);
    // Check if partial task already exists
    if (!exists) {
      throw new EntityNotFound('Partial task does not exist');
    }

    const record = await repository.updatePartialTask(params);
    if (!record) {
      throw new EntityUpdateError('Failed to update partial task');
    }

    this.logger.log(
      'info',
      `Updated the status of partial task "${params.id}" to "${params.status}" with reason: "${params.reason ?? ''}", and attempt number: ${
        params.attempts ?? '0'
      }`
    );

    const model = convertTaskEntityToResponse(record);
    return model;
  }

  public async createResource(resource: IPartialTaskCreate): Promise<IPartialTaskResponse> {
    const repository = await this.getRepository();

    const record = await repository.createPartialTask(resource);
    if (!record) {
      throw new EntityCreationError('Error creating partial task');
    }

    const model = convertTaskEntityToResponse(record);
    return model;
  }

  public async deleteResource(task: IPartialTaskParams): Promise<DeleteResult> {
    const repository = await this.getRepository();

    // Check if discrete exists
    const partial = await repository.get(task);
    if (!partial) {
      throw new EntityNotFound('Partial task does not exist');
    }

    const res = await repository.deletePartialTask(task);
    return res;
  }

  private async getRepository(): Promise<PartialTaskRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getPartialTaskRepository();
    }
    return this.repository;
  }
}
