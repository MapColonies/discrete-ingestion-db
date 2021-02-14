import { Repository, EntityRepository, DeleteResult } from 'typeorm';
import { container } from 'tsyringe';
import { IDiscreteTaskCreate, IDiscreteTaskParams, IDiscreteTaskSave, IDiscreteTaskStatusUpdate, ILogger } from '../../common/interfaces';
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

  /**
   * Create a new discrete task
   * @param params Discrete task params
   */
  public async createDiscreteTask(params: IDiscreteTaskCreate): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    const discrete: IDiscreteTaskSave = {
      id: params.id,
      version: params.version,
      metadata: params.metadata,
    };

    // Check if discrete already exists
    const exists = await this.exists(discrete);
    if (exists) {
      throw new Error('Discrete already exists');
    }

    return this.save(discrete);
  }

  /**
   * Get all discrete tasks
   * @param updateDateOrder Result order by update date field
   */
  public async getAll(updateDateOrder: SearchOrder): Promise<DiscreteTaskEntity[] | undefined> {
    //TODO: add custom error and logging
    return this.find({
      order: { updateDate: updateDateOrder },
      relations: ['tasks'],
    });
  }

  /**
   * Get a discrete by given parameters
   * @param params Discrete task params
   */
  public async get(params: IDiscreteTaskParams): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.findOne({
      relations: ['tasks'],
      where: params,
    });
  }

  /**
   * Delete discrete by parameters
   * @param params Discrete task params
   */
  public async deleteDiscreteTask(params: IDiscreteTaskParams): Promise<DeleteResult> {
    //TODO: add custom error and logging
    return this.delete(params);
  }

  /**
   * Update discrete task status
   * @param statusUpdate Discrete task update params
   */
  public async updateDiscreteTask(statusUpdate: IDiscreteTaskStatusUpdate): Promise<DiscreteTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.save(statusUpdate);
  }

  /**
   * Check if discrete exists by params
   * @param params Discrete task params
   */
  public async exists(params: IDiscreteTaskParams): Promise<boolean> {
    //TODO: add custom error and logging
    const res = await this.get(params);
    return res != undefined;
  }
}
