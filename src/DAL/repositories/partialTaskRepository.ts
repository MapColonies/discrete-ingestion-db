import { Repository, EntityRepository, DeleteResult } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger, IPartialTaskCreate, IPartialTaskParams, IPartialTaskStatusUpdate } from '../../common/interfaces';
import { SearchOrder, Services } from '../../common/constants';
import { PartialTaskEntity } from '../entity/partialTask';
import { DiscreteTaskEntity } from '../entity/discreteTask';

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
  public async getAll(discrete: DiscreteTaskEntity, updateDateOrder: SearchOrder): Promise<PartialTaskEntity[] | undefined> {
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
      `Updated the status of partial task "${statusUpdate.id}" to "${statusUpdate.status}" with reason: "${statusUpdate.reason ?? ''}"`
    );
    //TODO: add custom error and logging
    return this.save(statusUpdate);
  }

  public async deletePartialTask(task: IPartialTaskParams): Promise<DeleteResult> {
    this.appLogger.log('info', `Deleting partial task with id "${task.id}"`);
    //TODO: add custom error and logging
    return this.createQueryBuilder().delete().from(PartialTaskEntity).where({ id: task.id }).execute();
  }
}
