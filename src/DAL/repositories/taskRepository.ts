import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { EntityNotFound } from '../../common/errors';
import { TaskEntity } from '../entity/task';
import { TaskModelConvertor } from '../convertors/taskModelConvertor';
import {
  GetTasksResponse,
  IAllTasksParams,
  ICreateTaskRequest,
  ICreateTaskResponse,
  IGetTaskResponse,
  ISpecificTaskParams,
  IUpdateTaskRequest,
} from '../../common/dataModels/tasks';

@EntityRepository(TaskEntity)
export class JobRepository extends Repository<TaskEntity> {
  private readonly appLogger: ILogger; //don't override internal repository logger.
  private readonly taskConvertor: TaskModelConvertor;

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
    this.taskConvertor = container.resolve(TaskModelConvertor);
  }

  public async getTasks(req: IAllTasksParams): Promise<GetTasksResponse> {
    const entities = await this.find(req);
    const models = entities.map((entity) => this.taskConvertor.entityToModel(entity));
    return models;
  }

  public async createTask(req: ICreateTaskRequest): Promise<ICreateTaskResponse> {
    let entity = this.taskConvertor.createModelToEntity(req);
    entity = await this.save(entity);
    const model: ICreateTaskResponse = {
      id: entity.id,
    };
    return model;
  }

  public async getTask(req: ISpecificTaskParams): Promise<IGetTaskResponse | undefined> {
    const entity = await this.findOne({ id: req.taskId, jobId: req.jobId });
    const model = entity ? this.taskConvertor.entityToModel(entity) : undefined;
    return model;
  }

  public async exists(taskIdentifier: ISpecificTaskParams): Promise<boolean> {
    const taskCount = await this.count({ id: taskIdentifier.taskId, jobId: taskIdentifier.jobId });
    return taskCount === 1;
  }

  public async updateTask(req: IUpdateTaskRequest): Promise<void> {
    if (!(await this.exists(req))) {
      throw new EntityNotFound(`task not found for update: job id: ${req.jobId} task id: ${req.taskId}`);
    }
    const entity = this.taskConvertor.updateModelToEntity(req);
    await this.save(entity);
  }

  public async deleteTask(taskIdentifier: ISpecificTaskParams): Promise<void> {
    if (!(await this.exists(taskIdentifier))) {
      throw new EntityNotFound(`task not found for delete: job id: ${taskIdentifier.jobId} task id: ${taskIdentifier.taskId}`);
    }
    await this.delete(taskIdentifier);
  }
}
