import { EntityRepository, In, LessThan, Brackets } from 'typeorm';
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
  IFindInactiveTasksRequest,
  IFindTasksRequest,
  IGetTaskResponse,
  ISpecificTaskParams,
  ITaskType,
  IUpdateTaskRequest,
} from '../../common/dataModels/tasks';
import { OperationStatus } from '../../common/dataModels/enums';
import { GeneralRepository } from './generalRepository';

declare type SqlRawResponse = [unknown[], number];

@EntityRepository(TaskEntity)
export class TaskRepository extends GeneralRepository<TaskEntity> {
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

  public async findTasks(req: IFindTasksRequest): Promise<GetTasksResponse> {
    const entities = await this.find({
      where: req,
    });
    const models = entities.map((entity) => this.taskConvertor.entityToModel(entity));
    return models;
  }

  public async createTask(req: CreateTasksRequest): Promise<CreateTasksResponse> {
    try {
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
    } catch (err) {
      const pgForeignKeyViolationErrorCode = '23503';
      const error = err as Error & { code: string };
      if (error.code === pgForeignKeyViolationErrorCode && error.message.includes('FK_task_job_id')) {
        this.appLogger.log('info', `failed to create task because job doesn't exist for the requested jobId`);
        throw new EntityNotFound(`job doesn't exist for the requested jobId`);
      } else {
        throw err;
      }
    }
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
    const res = (await this.queryEnhanced(retrieveAndUpdateQuery, [taskType, jobType])) as SqlRawResponse;

    if (res[1] === 0) {
      return undefined;
    }
    const entity = res[0][0] as TaskEntity;
    return this.taskConvertor.entityToModel(entity);
  }

  public async releaseInactiveTask(taskIds: string[]): Promise<string[]> {
    const res = await this.createQueryBuilder()
      .update()
      .set({ status: OperationStatus.PENDING, attempts: () => 'attempts + 1' })
      .where({ id: In(taskIds), status: OperationStatus.IN_PROGRESS })
      .returning('id')
      .updateEntity(true)
      .execute();
    const raw = res.raw as { id: string }[];
    const updatedIds = raw.map((value) => {
      return (value as TaskEntity).id;
    });
    return updatedIds;
  }

  public async findInactiveTasks(req: IFindInactiveTasksRequest): Promise<string[]> {
    //find timed out "In-Progress" tasks (of given types if requested)
    const secToMsConversionRate = 1000;
    const olderThen = new Date(Date.now() - req.inactiveTimeSec * secToMsConversionRate);
    let query = this.createQueryBuilder('tk')
      .select('tk.id AS id')
      .where({
        status: OperationStatus.IN_PROGRESS,
        updateTime: LessThan(olderThen),
      });
    const hasTypes = req.types != undefined && req.types.length > 0;
    const hasIgnoredTypes = req.ignoreTypes != undefined && req.ignoreTypes.length > 0;
    if (hasTypes || hasIgnoredTypes) {
      query = query.innerJoin('tk.jobId', 'jb');
      if (hasTypes) {
        const types = req.types as ITaskType[];
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('tk.type =  :taskType AND jb.type = :jobType', types[0]);
            for (let i = 1; i < types.length; i++) {
              qb.orWhere('tk.type =  :taskType AND jb.type = :jobType', types[i]);
            }
          })
        );
      }
      if (hasIgnoredTypes) {
        const ignoredTypes = req.ignoreTypes as ITaskType[];
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where('NOT (tk.type =  :taskType AND jb.type = :jobType)', ignoredTypes[0]);
            for (let i = 1; i < ignoredTypes.length; i++) {
              qb.andWhere('NOT (tk.type =  :taskType AND jb.type = :jobType)', ignoredTypes[i]);
            }
          })
        );
      }
    }

    const res = (await query.execute()) as { id: string }[];
    return res.map((value) => value.id);
  }

  public async checkIfAllCompleted(jobId: string): Promise<boolean> {
    const count = await this.count({ where: { jobId } });
    const allCompleted = await this.getTasksCountByStatus(OperationStatus.COMPLETED, jobId);
    return count === allCompleted;
  }

  public async getTasksCountByStatus(status: OperationStatus, jobId: string): Promise<number> {
    const count = await this.count({
      where: {
        status,
        jobId,
      },
    });
    return count;
  }

  public async updateTasksOfExpiredJobs(): Promise<void> {
    const query = this.createQueryBuilder()
      .update()
      .set({ status: OperationStatus.EXPIRED })
      .where(
        `"jobId" IN (
        SELECT id
        FROM "Job" as jb
        WHERE jb.status = :status)`,
        { status: OperationStatus.EXPIRED }
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where([{ status: OperationStatus.IN_PROGRESS }, { status: OperationStatus.PENDING }]);
        })
      );
    await query.execute();
  }

  public async resetJobTasks(jobId: string): Promise<void> {
    await this.createQueryBuilder()
      .update()
      .set({ status: OperationStatus.PENDING, reason: '', attempts: 0, percentage: 0 })
      .where('"jobId" = :jobId', { jobId })
      .andWhere(
        new Brackets((qb) => {
          qb.where([{ status: OperationStatus.FAILED }, { status: OperationStatus.EXPIRED }]);
        })
      )
      .execute();
  }
}
