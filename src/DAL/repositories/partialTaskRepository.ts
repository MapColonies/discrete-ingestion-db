import { Repository, EntityRepository, DeleteResult } from 'typeorm';
import { container } from 'tsyringe';
import {
  IDiscreteTaskParams,
  ILogger,
  IPartialTaskCreate,
  IPartialTaskParams,
  IPartialTaskStatusCount,
  IPartialTaskStatusUpdate,
} from '../../common/interfaces';
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
    return this.save(params);
  }

  /**
   * Get all partial tasks of the given discrete
   * @param discrete Discrete entity of which tasks we want
   * @param updateDateOrder Order results by update date
   */
  public async getAll(discrete: IDiscreteTaskParams, updateDateOrder: SearchOrder): Promise<PartialTaskEntity[] | undefined> {
    // Custom query to get all tasks by given discrete
    return this.createQueryBuilder()
      .where('discrete_id=:id and discrete_version=:version', { id: discrete.id, version: discrete.version })
      .orderBy('update_date', updateDateOrder)
      .getMany();
  }

  /**
   * Get all partial tasks of the given discrete
   * @param discrete Discrete entity of which tasks we want
   */
  public async getAllStatuses(discrete: IDiscreteTaskParams): Promise<IPartialTaskStatusCount[] | undefined> {
    // Custom query to get all task statuses by given discrete
    // eslint-disable-next-line
    return this.createQueryBuilder()
      .select('status, count(*)')
      .where('discrete_id=:id and discrete_version=:version', { id: discrete.id, version: discrete.version })
      .groupBy('status')
      .execute();
  }

  /**
   * Get partial task by given params
   * @param params Partial task params
   */
  public async get(params: IPartialTaskParams): Promise<PartialTaskEntity | undefined> {
    return this.findOne(params);
  }

  /**
   * Update the status of a partial task
   * @param statusUpdate Partial task status update params
   */
  public async updatePartialTask(statusUpdate: IPartialTaskStatusUpdate): Promise<PartialTaskEntity | undefined> {
    return this.save(statusUpdate);
  }

  public async deletePartialTask(task: IPartialTaskParams): Promise<DeleteResult> {
    return this.delete({ id: task.id });
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
