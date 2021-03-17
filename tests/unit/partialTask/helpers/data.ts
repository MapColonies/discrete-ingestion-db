import { Status } from '../../../../src/common/constants';
import { DiscreteTaskEntity } from '../../../../src/DAL/entity/discreteTask';

const discreteName = 'discreteName';
const discreteVersion = '1.1.1';
const discreteTaskParams = {
  id: discreteName,
  version: discreteVersion,
};

const partialTaskParams = {
  id: '25bb28bb-e712-4841-9a23-f827eb0fa243',
};
const updateDate: string = new Date('10-10-2020').toUTCString();
const minZoom = 0;
const maxZoom = 9;

const taskZoomBounds = {
  minZoom,
  maxZoom,
};

const taskResponse = {
  id: partialTaskParams.id,
  ...taskZoomBounds,
  updateDate: updateDate,
  status: Status.PENDING,
  attempts: 0,
};

const discrete: DiscreteTaskEntity = {
  id: discreteName,
  version: discreteVersion,
  metadata: {},
  updateDate: new Date('10-10-2020'),
  status: Status.PENDING,
  reason: '',
  isCleaned: false,
};

const partialTaskCreateParams = {
  ...partialTaskParams,
  discrete: discrete,
  ...taskZoomBounds,
};

export const partialTaskCreate = {
  params: partialTaskCreateParams,
  response: taskResponse,
};

export const partialTaskGet = {
  params: partialTaskParams,
  body: taskZoomBounds,
  response: taskResponse,
};

export const partialTaskGetError = {
  params: partialTaskParams,
};

export const partialTaskGetByDiscrete = {
  params: discreteTaskParams,
  response: [taskResponse, taskResponse, taskResponse, taskResponse],
};

export const partialTaskGetStatusCountByDiscrete = {
  params: discreteTaskParams,
  getAllStatuses: [
    { status: Status.PENDING, count: 1 },
    { status: Status.FAILED, count: 1 },
    { status: Status.COMPLETED, count: 2 },
  ],
  response: {
    total: 4,
    failed: 1,
    completed: 2,
  },
};

export const partialTaskGetAllError = {
  params: discreteTaskParams,
};

export const partialTaskUpdateCompleted = {
  params: partialTaskParams,
  body: {
    status: Status.COMPLETED,
  },
  response: {},
};

export const partialTaskUpdateError = {
  params: partialTaskParams,
  body: {
    status: Status.COMPLETED,
  },
};

export const partialTaskPutError = {
  params: partialTaskParams,
  body: {
    status: Status.COMPLETED,
  },
};

export const partialTaskDelete = {
  params: partialTaskParams,
  existsResponse: true,
  response: taskResponse,
};

export const partialTaskDeleteError = {
  params: partialTaskParams,
  existsResponse: false,
  response: undefined,
};
