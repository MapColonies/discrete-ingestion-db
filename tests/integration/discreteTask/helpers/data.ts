import { Status } from '../../../../src/common/constants';

const discreteName = 'discreteName';
const discreteVersion = '1.1.1';
const discreteTaskParams = {
  id: discreteName,
  version: discreteVersion,
};
const updateDate: string = new Date('10-10-2020').toUTCString();

const tasks = [
  {
    minZoom: 0,
    maxZoom: 8,
  },
  {
    minZoom: 9,
    maxZoom: 14,
  },
  {
    minZoom: 15,
    maxZoom: 17,
  },
  {
    minZoom: 18,
    maxZoom: 19,
  },
];

const taskIds = [
  'ad01058f-aae1-461e-9933-e4322b6e8c87',
  '7d1bbe41-cd0f-4772-8201-4a0401dde3bb',
  'ccb7c1ee-3195-4a10-b326-5769469be1b4',
  '06bc2358-1411-4e00-996a-33bfda6b543a',
];

const tasksResponse = taskIds.map((taskId, index) => {
  const task = {
    id: taskId,
    minZoom: tasks[index].minZoom,
    maxZoom: tasks[index].maxZoom,
    updateDate: updateDate,
    status: Status.PENDING,
    attempts: 0,
  };
  return task;
});

const discreteTask = {
  id: discreteName,
  version: discreteVersion,
  tasks: tasksResponse,
  metadata: {},
  updateDate: updateDate,
  status: Status.PENDING,
};

export const discreteTaskCreateOk = {
  params: discreteTaskParams,
  body: {
    tasks: tasks,
    metadata: {},
  },
  response: taskIds,
};

export const discreteTaskGetOk = {
  params: discreteTaskParams,
  body: {
    tasks: tasks,
    metadata: {},
  },
  response: discreteTask,
};

export const discreteTaskGetAll = {
  params: discreteTaskParams,
  response: [discreteTask, discreteTask, discreteTask, discreteTask, discreteTask],
};

export const discreteTaskUpdateCompleted = {
  params: discreteTaskParams,
  body: {
    status: Status.COMPLETED,
  },
};

export const discreteTaskDelete = {
  params: discreteTaskParams,
  taskResponse: tasksResponse,
};

export const discreteTaskGetError = {
  params: discreteTaskParams,
};

export const discreteTaskPutError = {
  params: discreteTaskParams,
  body: {
    status: Status.COMPLETED,
  },
};

export const discreteTaskPostError = {
  params: discreteTaskParams,
  body: {
    tasks: tasks,
    metadata: {},
  },
  response: discreteTask,
};

export const discreteTaskDeleteError = {
  params: discreteTaskParams,
};

export const discreteTaskCreateError = {
  params: discreteTaskParams,
  body: {
    tasks: tasks,
    metadata: {},
  },
};
