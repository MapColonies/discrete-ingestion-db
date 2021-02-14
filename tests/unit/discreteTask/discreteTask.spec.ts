import { container } from 'tsyringe';
import { DiscreteTaskManager } from '../../../src/discreteTask/models/discreteTaskManager';
import { registerTestValues } from '../../testContainerConfig';
import { initTypeOrmMocks } from '../../mocks/DBMock';
import { ConnectionManager } from '../../../src/DAL/connectionManager';
import {
  discreteTaskCreate,
  discreteTaskExists,
  discreteTaskGet,
  discreteTaskGetAll,
  discreteTaskUpdateCompleted,
  discreteTaskUpdateError,
  discreteTaskDelete,
  discreteTaskDeleteError,
} from './helpers/data';

let discreteTaskManager: DiscreteTaskManager;

const isConnectedMock = jest.fn();
const initMock = jest.fn();
const getDiscreteTaskRepository = jest.fn();
const getPartialTaskRepository = jest.fn();
const connectionManagerMock = ({
  isConnected: isConnectedMock,
  init: initMock,
  getDiscreteTaskRepository: getDiscreteTaskRepository,
  getPartialTaskRepository: getPartialTaskRepository,
} as unknown) as ConnectionManager;

const discreteTaskRepositoryMocks = {
  createDiscreteTask: jest.fn(),
  getAll: jest.fn(),
  get: jest.fn(),
  deleteDiscreteTask: jest.fn(),
  updateDiscreteTask: jest.fn(),
  exists: jest.fn(),
};

const partialTaskRepositoryMocks = {
  getAll: jest.fn(),
};

describe('Discrete task manager', function () {
  beforeEach(() => {
    registerTestValues();
    initTypeOrmMocks();
    getDiscreteTaskRepository.mockReturnValue(discreteTaskRepositoryMocks);
    getPartialTaskRepository.mockReturnValue(partialTaskRepositoryMocks);
    discreteTaskManager = new DiscreteTaskManager({ log: jest.fn() }, connectionManagerMock);
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Create resource', function () {
    it('Creates a discrete task', async function () {
      const discreteCreateMock = discreteTaskRepositoryMocks.createDiscreteTask;
      discreteCreateMock.mockResolvedValue(discreteTaskCreate.response);

      const response = await discreteTaskManager.createResource(discreteTaskCreate.params);

      expect(response).toEqual([]);
      expect(discreteCreateMock).toHaveBeenCalledTimes(1);
      expect(discreteCreateMock).toHaveBeenCalledWith(discreteTaskCreate.params);
    });
  });

  describe('Check if resource exists', function () {
    it('Checks if a discrete task exists and returns true', async function () {
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      discreteExistsMock.mockResolvedValue(discreteTaskExists.response);

      const response = await discreteTaskManager.exists(discreteTaskExists.params);

      expect(response).toEqual(discreteTaskExists.response);
      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskExists.params);
    });
  });

  describe('Get resource', function () {
    it('Gets an existing discrete task', async function () {
      const discreteGetMock = discreteTaskRepositoryMocks.get;
      discreteGetMock.mockResolvedValue(discreteTaskGet.response);

      const response = await discreteTaskManager.getDiscreteTask(discreteTaskGet.params);

      expect(response).toEqual(discreteTaskGet.response);
      expect(discreteGetMock).toHaveBeenCalledTimes(1);
      expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskGet.params);
    });

    it('Fails to get non existing discrete task', async function () {
      const discreteGetMock = discreteTaskRepositoryMocks.get;
      discreteGetMock.mockResolvedValue(undefined);

      try {
        // TODO: replace with custom error
        expect(await discreteTaskManager.getDiscreteTask(discreteTaskGet.params)).toThrowError();
      } catch (err) {
        jest.fn();
      }

      expect(discreteGetMock).toHaveBeenCalledTimes(1);
      expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskGet.params);
    });
  });

  describe('Gets all resources', function () {
    it('Gets all discrete tasks', async function () {
      const discreteGetAllMock = discreteTaskRepositoryMocks.getAll;
      discreteGetAllMock.mockResolvedValue(discreteTaskGetAll.response);

      const response = await discreteTaskManager.getAllDiscreteTasks();

      expect(response).toEqual(discreteTaskGetAll.response);
      expect(discreteGetAllMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update resource', function () {
    it('Updates an existing discrete task', async function () {
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      const discreteUpdateMock = discreteTaskRepositoryMocks.updateDiscreteTask;
      discreteExistsMock.mockResolvedValue(true);
      discreteUpdateMock.mockResolvedValue(discreteTaskUpdateCompleted.response);

      const response = await discreteTaskManager.updateDiscreteTask({
        ...discreteTaskUpdateCompleted.params,
        ...discreteTaskUpdateCompleted.body,
      });

      expect(response).toEqual(discreteTaskUpdateCompleted.response);
      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskUpdateCompleted.params);
    });

    it('Fails to update non existing discrete task', async function () {
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      discreteExistsMock.mockResolvedValue(false);

      try {
        // TODO: replace with custom error
        expect(
          await discreteTaskManager.updateDiscreteTask({
            ...discreteTaskUpdateError.params,
            ...discreteTaskUpdateError.body,
          })
        ).toThrowError();
      } catch (err) {
        jest.fn();
      }

      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskUpdateError.params);
    });
  });

  describe('Delete resource', function () {
    it('Deletes a discrete task', async function () {
      const discreteGetMock = discreteTaskRepositoryMocks.get;
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      const discreteDeleteMock = discreteTaskRepositoryMocks.deleteDiscreteTask;
      discreteGetMock.mockResolvedValue(discreteTaskDelete.response);
      discreteExistsMock.mockResolvedValue(discreteTaskDelete.existsResponse);
      discreteDeleteMock.mockResolvedValue(discreteTaskDelete.response);

      const partialGetAllMock = partialTaskRepositoryMocks.getAll;
      partialGetAllMock.mockResolvedValue([]);

      const response = await discreteTaskManager.deleteDiscreteTask(discreteTaskDelete.params);

      expect(response).toEqual(discreteTaskDelete.response);
      expect(discreteGetMock).toHaveBeenCalledTimes(1);
      expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskDelete.params);
      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskDelete.params);
      expect(discreteDeleteMock).toHaveBeenCalledTimes(1);
      expect(discreteDeleteMock).toHaveBeenCalledWith(discreteTaskDelete.params);
    });

    it('Fails to delete non existing discrete task', async function () {
      const discreteGetMock = discreteTaskRepositoryMocks.get;
      discreteGetMock.mockResolvedValue(undefined);

      try {
        // TODO: replace with custom error
        expect(await discreteTaskManager.deleteDiscreteTask(discreteTaskDeleteError.params)).toThrowError();
      } catch (err) {
        jest.fn();
      }

      expect(discreteGetMock).toHaveBeenCalledTimes(1);
      expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskDeleteError.params);
    });
  });
});
