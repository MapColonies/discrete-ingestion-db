import { Status } from '../../../../src/common/constants';

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

export const partialTaskGetOk = {
  params: partialTaskParams,
  body: taskZoomBounds,
  response: taskResponse,
};

export const partialTaskGetAll = {
  params: discreteTaskParams,
  response: [taskResponse, taskResponse, taskResponse, taskResponse],
};

export const partialTaskGetAllError = {
  params: discreteTaskParams,
};

export const partialTaskUpdateCompleted = {
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

export const partialTaskGetError = {
  params: partialTaskParams,
};
