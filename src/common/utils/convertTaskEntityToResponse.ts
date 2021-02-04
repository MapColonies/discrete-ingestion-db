import { PartialTaskEntity } from '../../DAL/entity/partialTask';
import { IPartialTaskResponse } from '../interfaces';

export default function convert(task: PartialTaskEntity): IPartialTaskResponse {
  const { discrete, ...taskResponse } = task;
  const response: IPartialTaskResponse = taskResponse;
  return response;
}
