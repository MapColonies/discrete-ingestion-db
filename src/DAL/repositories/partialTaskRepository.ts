import { Repository, EntityRepository, DeleteResult } from 'typeorm';
import { container } from 'tsyringe';
import { IDiscreteTaskParams, ILogger, IPartialTaskCreate, IPartialTaskParams, IPartialTaskStatusUpdate } from '../../common/interfaces';
import { SearchOrder, Services } from '../../common/constants';
import { PartialTaskEntity } from '../entity/partialTask';

@EntityRepository(PartialTaskEntity)
export class PartialTaskRepository extends Repository<PartialTaskEntity> {
  private readonly appLogger: ILogger; //don't override internal repository logger.

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
  }

  /**
   * Create a new partial task
   * @param params Partial task params
   */
  public async createPartialTask(params: IPartialTaskCreate): Promise<PartialTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.save(params);
  }

  /**
   * Get all partial tasks of the given discrete
   * @param discrete Discrete entity of which tasks we want
   * @param updateDateOrder Order results by update date
   */
  public async getAll(discrete: IDiscreteTaskParams, updateDateOrder: SearchOrder): Promise<PartialTaskEntity[] | undefined> {
    //TODO: add custom error and logging
    // Custom query to get all tasks by given discrete
    return this.createQueryBuilder()
      .where('discrete_id=:id and discrete_version=:version', { id: discrete.id, version: discrete.version })
      .orderBy('update_date', updateDateOrder)
      .getMany();
  }

  /**
   * Get partial task by given params
   * @param params Partial task params
   */
  public async get(params: IPartialTaskParams): Promise<PartialTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.findOne(params);
  }

  /**
   * Update the status of a partial task
   * @param statusUpdate Partial task status update params
   */
  public async updatePartialTask(statusUpdate: IPartialTaskStatusUpdate): Promise<PartialTaskEntity | undefined> {
    this.appLogger.log(
      'info',
      `Updated the status of partial task "${statusUpdate.id}" to "${statusUpdate.status}" with reason: "${
        statusUpdate.reason ?? ''
      }", and attempt number: ${statusUpdate.attempts ?? ''}`
    );
    //TODO: add custom error and logging
    return this.save(statusUpdate);
  }

  public async deletePartialTask(task: IPartialTaskParams): Promise<DeleteResult> {
    //TODO: add custom error and logging
    return this.createQueryBuilder().delete().from(PartialTaskEntity).where({ id: task.id }).execute();
  }

  /**
   * Check if discrete exists by params
   * @param params Discrete task params
   */
  public async exists(params: IPartialTaskParams): Promise<boolean> {
    const res = await this.get(params);
    return res != undefined;
  }
}
