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

  public async createPartialTask(params: IPartialTaskCreate): Promise<PartialTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.save(params);
  }

  public async getAll(discrete: DiscreteTaskEntity, updateDateOrder: SearchOrder): Promise<PartialTaskEntity[] | undefined> {
    //TODO: add custom error and logging
    this.appLogger.log('debug', `Discrete: ${JSON.stringify(discrete)}`);
    // return this.find({ where: { discrete: { id: discrete.id, version: discrete.version } }, order: { updateDate: updateDateOrder } });
    return this.createQueryBuilder().where('discrete_id=:id and discrete_version=:version', { id: discrete.id, version: discrete.version }).getMany();
  }

  public async get(params: IPartialTaskParams): Promise<PartialTaskEntity | undefined> {
    //TODO: add custom error and logging
    return this.findOne(params);
  }

  public async updatePartialTask(statusUpdate: IPartialTaskStatusUpdate): Promise<PartialTaskEntity | undefined> {
    this.appLogger.log(
      'info',
      `Updated the status of partial task "${statusUpdate.id}" to "${statusUpdate.status}" with reason: "${statusUpdate.reason}"`
    );
    //TODO: add custom error and logging
    return this.save(statusUpdate);
  }

  public async deletePartialTask(task: IPartialTaskParams): Promise<DeleteResult> {
    // this.appLogger.log('info', `Deleting partial tasks for discrete "${discrete.id}" with version "${discrete.version}"`);
    //TODO: add custom error and logging
    this.appLogger.log('debug', 'Deleting task');
    return this.createQueryBuilder().delete().from(PartialTaskEntity).where({ id: task.id }).execute();
  }
}
