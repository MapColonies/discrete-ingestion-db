import { Repository, EntityRepository, DeleteResult } from 'typeorm';
import { container } from 'tsyringe';
import { IDiscreteTaskCreate, IDiscreteTaskParams, IDiscreteTaskStatusUpdate, ILogger } from '../../common/interfaces';
import { SearchOrder, Services } from '../../common/constants';
import { DiscreteTaskEntity } from '../entity/discreteTask';

@EntityRepository(DiscreteTaskEntity)
export class DiscreteTaskRepository extends Repository<DiscreteTaskEntity> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
  }

  public async createDiscreteTask(params: IDiscreteTaskCreate): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.save(params);
  }

  public async getAll(updateDateOrder: SearchOrder): Promise<DiscreteTaskEntity[] | undefined> {
    //TODO: add custom error and logging
    return this.find({
      order: { updateDate: updateDateOrder },
      relations: ['tasks'],
    });
  }

  public async get(params: IDiscreteTaskParams): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.findOne({
      relations: ['tasks'],
      where: params,
    });
  }

  public async deleteDiscreteTask(params: IDiscreteTaskParams): Promise<DeleteResult> {
    //TODO: add custom error and logging
    return this.createQueryBuilder().delete().from(DiscreteTaskEntity).where(params).execute();
  }

  public async updateDiscreteTask(statusUpdate: IDiscreteTaskStatusUpdate): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.save(statusUpdate);
  }
}
