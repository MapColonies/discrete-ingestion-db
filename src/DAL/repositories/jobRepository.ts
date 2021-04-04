import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { JobEntity } from '../entity/job';
import {
  FindJobsResponse,
  ICreateJobBody,
  ICreateJobResponse,
  IGetJobResponse,
  IFindJobsRequest,
  IUpdateJobRequest,
} from '../../common/dataModels/jobs';
import { JobModelConvertor } from '../convertors/jobModelConverter';
import { DBConstraintError, EntityNotFound } from '../../common/errors';

@EntityRepository(JobEntity)
export class JobRepository extends Repository<JobEntity> {
  private readonly appLogger: ILogger; //don't override internal repository logger.
  private readonly jobConvertor: JobModelConvertor;

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
    this.jobConvertor = container.resolve(JobModelConvertor);
  }

  public async findJobs(req: IFindJobsRequest): Promise<FindJobsResponse> {
    const entities = await this.find({ where: req, relations: ['tasks'] });
    const models = entities.map((entity) => this.jobConvertor.entityToModel(entity));
    return models;
  }

  public async createJob(req: ICreateJobBody): Promise<ICreateJobResponse> {
    let entity = this.jobConvertor.createModelToEntity(req);
    entity = await this.save(entity);
    return {
      id: entity.id,
      taskIds: entity.tasks.map((task) => task.id),
    };
  }

  public async getJob(id: string): Promise<IGetJobResponse | undefined> {
    const entity = await this.findOne(id, { relations: ['tasks'] });
    const model = entity ? this.jobConvertor.entityToModel(entity) : undefined;
    return model;
  }

  public async updateJob(req: IUpdateJobRequest): Promise<void> {
    if (!(await this.exists(req.jobId))) {
      throw new EntityNotFound(` job ${req.jobId} was not found for update request`);
    }
    const entity = this.jobConvertor.updateModelToEntity(req);
    await this.save(entity);
  }

  public async exists(id: string): Promise<boolean> {
    const jobCount = await this.count({ id: id });
    return jobCount === 1;
  }

  public async deleteJob(id: string): Promise<void> {
    if (!(await this.exists(id))) {
      throw new EntityNotFound(` job ${id} was not found for delete request`);
    }
    try {
      await this.delete(id);
    } catch (err) {
      const pgForeignKeyConstraintViolationErrorCode = '23503';
      const error = err as Error & { code: string };
      if (error.code === pgForeignKeyConstraintViolationErrorCode) {
        this.appLogger.log('info', `failed to delete job ${id} because it have tasks`);
        throw new DBConstraintError(`job ${id} have tasks`);
      } else {
        throw err;
      }
    }
  }
}
