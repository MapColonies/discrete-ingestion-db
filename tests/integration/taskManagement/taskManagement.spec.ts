import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { registerTestValues } from '../../testContainerConfig';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import * as requestSender from './helpers/taskManagementRequestSender';

let taskRepositoryMocks: RepositoryMocks;
const jobId = '170dd8c0-8bad-498b-bb26-671dcf19aa3c';
const taskId = 'e1b051bf-e12e-4c1f-a257-f9de2de8bbfb';
let repositoryMock: TaskRepository;

describe('tasks', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    repositoryMock = new TaskRepository();
    taskRepositoryMocks = registerRepository(TaskRepository, repositoryMock);
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should return started task and status 200', async function () {
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
      taskRepositoryMocks.queryMock.mockResolvedValue([[taskModel], 1]);

      const response = await requestSender.retrieveAndStart('testType', '5');

      expect(taskRepositoryMocks.queryMock).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(taskModel);
    });

    it('should return list of inactive task - without types', async function () {
      const req = {
        inactiveTimeSec: 500,
      };
      const taskIds = ['6716ddc8-40fb-41b2-bf1d-5c433fe4728f'];
      const dbFindInactiveTasks = jest.fn();
      repositoryMock.findInactiveTasks = dbFindInactiveTasks;
      dbFindInactiveTasks.mockResolvedValue(taskIds);

      const response = await requestSender.findInactive(req);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(taskIds);
      expect(dbFindInactiveTasks).toHaveBeenCalledTimes(1);
      expect(dbFindInactiveTasks).toHaveBeenCalledWith(req);
    });

    it('should return list of inactive task - with types', async function () {
      const req = {
        inactiveTimeSec: 500,
        types: [
          {
            jodType: 'jbType',
            taskType: 'tkType',
          },
        ],
      };
      const taskIds = ['6716ddc8-40fb-41b2-bf1d-5c433fe4728f'];
      const dbFindInactiveTasks = jest.fn();
      repositoryMock.findInactiveTasks = dbFindInactiveTasks;
      dbFindInactiveTasks.mockResolvedValue(taskIds);

      const response = await requestSender.findInactive(req);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(taskIds);
      expect(dbFindInactiveTasks).toHaveBeenCalledTimes(1);
      expect(dbFindInactiveTasks).toHaveBeenCalledWith(req);
    });

    it('should release inactive tasks', async function () {
      const req = ['6716ddc8-40fb-41b2-bf1d-5c433fe4728f', '2f2ca364-6ce7-4154-a07a-af9ba3970ddf'];
      taskRepositoryMocks.queryBuilder.execute.mockResolvedValue({
        raw: [
          {
            id: '6716ddc8-40fb-41b2-bf1d-5c433fe4728f',
          },
        ],
      });

      const response = await requestSender.releaseInactive(req);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(['6716ddc8-40fb-41b2-bf1d-5c433fe4728f']);
      expect(taskRepositoryMocks.queryBuilder.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bad Path', function () {
    it('find inactive tasks with invalid body returns 400', async function () {
      const dbFindInactiveTasks = jest.fn();
      repositoryMock.findInactiveTasks = dbFindInactiveTasks;
      const req = {
        a: 'test',
      };
      const response = await requestSender.findInactive(req);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(dbFindInactiveTasks).toHaveBeenCalledTimes(0);
    });

    it('release inactive tasks with invalid body returns 400', async function () {
      const req = {
        a: 'test',
      };
      const response = await requestSender.releaseInactive(req);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(taskRepositoryMocks.queryBuilder.execute).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status 404 when no pending tasks are available', async function () {
      taskRepositoryMocks.queryMock.mockResolvedValue([[], 0]);

      const response = await requestSender.retrieveAndStart('testType', '5');

      expect(taskRepositoryMocks.queryMock).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });
  });
});
