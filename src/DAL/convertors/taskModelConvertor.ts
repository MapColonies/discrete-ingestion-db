import { singleton } from 'tsyringe';
import { ICreateTaskBody, ICreateTaskRequest, IGetTaskResponse } from '../../common/dataModels/tasks';
import { TaskEntity } from '../entity/task';

interface ITaskModel extends ICreateTaskBody {
  jobId?: string;
}

@singleton()
export class TaskModelConvertor {
  public modelToEntity(model: ICreateTaskBody): TaskEntity;
  public modelToEntity(model: ICreateTaskRequest): TaskEntity;
  public modelToEntity(model: ITaskModel): TaskEntity {
    const entity = new TaskEntity();
    Object.assign(entity, model);
    return entity;
  }

  public entityToModel(entity: TaskEntity): IGetTaskResponse {
    const model = { ...entity, created: entity.creationTime, updated: entity.updateTime } as { creationTime?: Date; updateTime?: Date };
    delete model.creationTime;
    delete model.updateTime;
    return model as IGetTaskResponse;
  }
}
