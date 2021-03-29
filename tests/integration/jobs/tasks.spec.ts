import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { registerTestValues } from '../../testContainerConfig';
import { TaskEntity } from '../../../src/DAL/entity/task';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import * as requestSender from './helpers/tasksRequestSender';

let taskRepositoryMocks: RepositoryMocks;
const jobId = '170dd8c0-8bad-498b-bb26-671dcf19aa3c';
const taskId = 'e1b051bf-e12e-4c1f-a257-f9de2de8bbfb';

describe('tasks', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    taskRepositoryMocks = registerRepository(TaskRepository, new TaskRepository());
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should create task and return status code 201 and the created task id', async function () {
      const createTaskModel = {
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const createTaskRes = {
        id: taskId,
      };
      const taskEntity = ({
        ...createTaskModel,
        jobId: jobId,
        id: taskId,
      } as unknown) as TaskEntity;

      const taskSaveMock = taskRepositoryMocks.saveMock;
      taskSaveMock.mockResolvedValue([taskEntity]);

      const response = await requestSender.createResource(jobId, createTaskModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(taskSaveMock).toHaveBeenCalledTimes(1);
      expect(taskSaveMock).toHaveBeenCalledWith([{ ...createTaskModel, jobId: jobId }]);

      const body = response.body as unknown;
      expect(body).toEqual(createTaskRes);
    });

    it('should create muptiple tasks and return status code 201 and the created tasks ids', async function () {
      const taskId2 = '6f3669b8-8a65-4581-a127-3d26332635ed';
      const createTaskModel1 = {
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const createTaskModel2 = {
        description: '6',
        parameters: {
          b: 7,
        },
        reason: '8',
        percentage: 9,
        type: '10',
      };
      const createTaskRes = {
        ids: [taskId, taskId2],
      };
      const partialTaskEntities = ([
        {
          ...createTaskModel1,
          jobId: jobId,
        },
        {
          ...createTaskModel2,
          jobId: jobId,
        },
      ] as unknown) as TaskEntity[];
      const fullTaskEntities = ([
        {
          ...createTaskModel1,
          jobId: jobId,
          id: taskId,
        },
        {
          ...createTaskModel2,
          jobId: jobId,
          id: taskId2,
        },
      ] as unknown) as TaskEntity[];

      const taskSaveMock = taskRepositoryMocks.saveMock;
      taskSaveMock.mockResolvedValue(fullTaskEntities);

      const response = await requestSender.createResource(jobId, [createTaskModel1, createTaskModel2]);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(taskSaveMock).toHaveBeenCalledTimes(1);
      expect(taskSaveMock).toHaveBeenCalledWith(partialTaskEntities);

      const body = response.body as unknown;
      expect(body).toEqual(createTaskRes);
    });

    it('should get all tasks and return 200', async function () {
      const taskModel = {
        jobId: jobId,
        id: taskId,
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const taskEntity = (taskModel as unknown) as TaskEntity;

      const taskFindMock = taskRepositoryMocks.findMock;
      taskFindMock.mockResolvedValue([taskEntity]);

      const response = await requestSender.getAllResources(jobId);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(taskFindMock).toHaveBeenCalledTimes(1);
      expect(taskFindMock).toHaveBeenCalledWith({
        jobId: jobId,
      });

      const tasks = response.body as unknown;
      expect(tasks).toEqual([taskModel]);
    });

    it('should return 204 for job without tasks', async function () {
      const jobsFindMock = taskRepositoryMocks.findMock;
      jobsFindMock.mockResolvedValue([] as TaskEntity[]);

      const response = await requestSender.getAllResources(jobId);

      expect(response.status).toBe(httpStatusCodes.NO_CONTENT);
      expect(jobsFindMock).toHaveBeenCalledTimes(1);
      expect(jobsFindMock).toHaveBeenCalledWith({
        jobId: jobId,
      });
    });

    it('should get specific task and return 200', async function () {
      const taskModel = {
        jobId: jobId,
        id: taskId,
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const taskEntity = (taskModel as unknown) as TaskEntity;

      const taskFinOneMock = taskRepositoryMocks.findOneMock;
      taskFinOneMock.mockResolvedValue(taskEntity);

      const response = await requestSender.getResource(jobId, taskId);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(taskFinOneMock).toHaveBeenCalledTimes(1);
      expect(taskFinOneMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
      });

      const task = response.body as unknown;
      expect(task).toEqual(taskModel);
    });

    it('should update task status and return 200', async function () {
      const taskCountMock = taskRepositoryMocks.countMock;
      const taskSaveMock = taskRepositoryMocks.saveMock;

      taskCountMock.mockResolvedValue(1);
      taskSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource(jobId, taskId, {
        status: 'In-Progress',
      });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(taskSaveMock).toHaveBeenCalledTimes(1);
      expect(taskSaveMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
        status: 'In-Progress',
      });
    });

    it('should delete task and return 200', async function () {
      const taskDeleteMock = taskRepositoryMocks.deleteMock;
      const taskCountMock = taskRepositoryMocks.countMock;
      taskDeleteMock.mockResolvedValue({});
      taskCountMock.mockResolvedValue(1);

      const response = await requestSender.deleteResource(jobId, taskId);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(taskDeleteMock).toHaveBeenCalledTimes(1);
      expect(taskDeleteMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
      });
    });
  });

  describe('Bad Path', function () {
    it('should return status code 400 on PUT request with invalid body', async function () {
      const taskCountMock = taskRepositoryMocks.countMock;

      const response = await requestSender.updateResource(jobId, taskId, {
        invalidFiled: 'test',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(taskCountMock).toHaveBeenCalledTimes(0);
    });

    it('should return status code 400 on POST request with invalid body', async function () {
      const taskCountMock = taskRepositoryMocks.countMock;
      const response = await requestSender.createResource(jobId, {
        id: 'invalidFiled',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(taskCountMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on GET request for non existing task', async function () {
      const taskFindOneMock = taskRepositoryMocks.findOneMock;
      taskFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getResource(jobId, taskId);

      expect(taskFindOneMock).toHaveBeenCalledTimes(1);
      expect(taskFindOneMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
      });
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on PUT request for non existing task', async function () {
      const taskCountMock = taskRepositoryMocks.countMock;
      const taskSaveMock = taskRepositoryMocks.saveMock;
      taskCountMock.mockResolvedValue(0);

      const response = await requestSender.updateResource(jobId, taskId, {
        status: 'Pending',
      });

      expect(taskCountMock).toHaveBeenCalledTimes(1);
      expect(taskCountMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
      });
      expect(taskSaveMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on DELETE request for non existing task', async function () {
      const taskCountMock = taskRepositoryMocks.countMock;
      const taskDeleteMock = taskRepositoryMocks.deleteMock;
      taskCountMock.mockResolvedValue(0);

      const response = await requestSender.deleteResource(jobId, taskId);

      expect(taskCountMock).toHaveBeenCalledTimes(1);
      expect(taskCountMock).toHaveBeenCalledWith({
        id: taskId,
        jobId: jobId,
      });
      expect(taskDeleteMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });
  });
});
