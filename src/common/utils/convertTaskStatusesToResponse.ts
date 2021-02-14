import { Status } from '../constants';
import { IPartialTasksStatuses, IPartialTaskStatusCount } from '../interfaces';

export default function (statusCount: IPartialTaskStatusCount[]): IPartialTasksStatuses {
  let sum = 0;
  statusCount.forEach((status) => {
    sum += parseInt(status.count);
  });

  const failed = statusCount.find((status) => status.status == Status.FAILED);
  const completed = statusCount.find((status) => status.status == Status.COMPLETED);
  return {
    total: sum,
    failed: parseInt(failed?.count || '0'),
    completed: parseInt(completed?.count || '0'),
  };
}
