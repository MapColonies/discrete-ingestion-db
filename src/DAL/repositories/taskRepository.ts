import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { EntityNotFound } from '../../common/errors';
import { TaskEntity } from '../entity/task';
import { TaskModelConvertor } from '../convertors/taskModelConvertor';
import {
  CreateTasksRequest,
  CreateTasksResponse,
  GetTasksResponse,
  IAllTasksParams,
  IGetTaskResponse,
  ISpecificTaskParams,
  IUpdateTaskRequest,
} from '../../common/dataModels/tasks';

declare type SqlRawResponse = [unknown[], number];

@EntityRepository(TaskEntity)
export class TaskRepository extends Repository<TaskEntity> {
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

  public async createTask(req: CreateTasksRequest): Promise<CreateTasksResponse> {
    let entities: TaskEntity[];
    if (Array.isArray(req)) {
      entities = req.map((model) => this.taskConvertor.createModelToEntity(model));
    } else {
      entities = [this.taskConvertor.createModelToEntity(req)];
    }
    entities = await this.save(entities);
    if (entities.length === 1) {
      return { id: entities[0].id };
    }
    return {
      ids: entities.map((entity) => entity.id),
    };
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
    await this.delete({ id: taskIdentifier.taskId, jobId: taskIdentifier.jobId });
  }

  public async retrieveAndUpdate(jobType: string, taskType: string): Promise<IGetTaskResponse | undefined> {
    const retrieveAndUpdateQuery = `
      UPDATE "Task"
      SET   status = 'In-Progress'::"operation_status_enum", "updateTime" = now() 
      WHERE  id = (
              SELECT tk.id
              FROM   "Task" AS tk
          INNER JOIN "Job" AS jb ON tk."jobId" = jb.id 
              WHERE  tk.status = 'Pending'::"operation_status_enum"
              AND tk.type = $1
              AND jb.type = $2
          ORDER BY jb.priority DESC
              LIMIT  1
              FOR    UPDATE SKIP LOCKED
              )
      RETURNING *;`;
    const res = (await this.query(retrieveAndUpdateQuery, [taskType, jobType])) as SqlRawResponse;

    if (res[1] === 0) {
      return undefined;
    }
    const entity = res[0][0] as TaskEntity;
    return this.taskConvertor.entityToModel(entity);
  }
}
