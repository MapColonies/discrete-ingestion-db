import { DeleteResult } from 'typeorm';
import { inject, injectable } from 'tsyringe';
import { SearchOrder, Services } from '../../common/constants';
import convertTaskEntityToResponse from '../../common/utils/convertTaskEntityToResponse';
import { ILogger, IPartialTaskCreate, IPartialTaskParams, IPartialTaskResponse, IPartialTaskStatusUpdate } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { PartialTaskRepository } from '../../DAL/repositories/partialTaskRepository';
import { DiscreteTaskEntity } from '../../DAL/entity/discreteTask';

@injectable()
export class PartialTaskManager {
  private repository?: PartialTaskRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async getPartialTasksByDiscrete(discrete: DiscreteTaskEntity, order: SearchOrder): Promise<IPartialTaskResponse[]> {
    const repository = await this.getRepository();
    const records = await repository.getAll(discrete, order);
    console.log(`records: ${JSON.stringify(records)}`);

    if (!records) {
      return Promise.reject();
    }

    const model = records.map((task) => convertTaskEntityToResponse(task));
    return model;
  }

  public async updatePartialTask(params: IPartialTaskStatusUpdate): Promise<IPartialTaskResponse> {
    const repository = await this.getRepository();
    const record = await repository.updatePartialTask(params);

    if (!record) {
      return Promise.reject();
    }

    const model = convertTaskEntityToResponse(record);
    return model;
  }

  public async createResource(resource: IPartialTaskCreate): Promise<IPartialTaskResponse> {
    const repository = await this.getRepository();
    const record = await repository.createPartialTask(resource);

    if (!record) {
      return Promise.reject();
    }

    const model = convertTaskEntityToResponse(record);
    return model;
  }

  public async deleteResource(task: IPartialTaskParams): Promise<DeleteResult> {
    const repository = await this.getRepository();
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
