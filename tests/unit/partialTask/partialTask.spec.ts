import { container } from 'tsyringe';
import { registerTestValues } from '../../testContainerConfig';
import { initTypeOrmMocks } from '../../mocks/DBMock';
import { partialTaskCreate, partialTaskGet, partialTaskGetError, partialTaskGetByDiscrete } from './helpers/data';
import { ConnectionManager } from '../../../src/DAL/connectionManager';
import { PartialTaskManager } from '../../../src/partialTask/models/partialTaskManager';
import { SearchOrder } from '../../../src/common/constants';

let partialTaskManager: PartialTaskManager;

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
  createPartialTask: jest.fn(),
  getAll: jest.fn(),
  get: jest.fn(),
  updatePartialTask: jest.fn(),
  deletePartialTask: jest.fn(),
  exists: jest.fn(),
};

describe('Discrete task manager', function () {
  beforeEach(() => {
    registerTestValues();
    initTypeOrmMocks();
    getDiscreteTaskRepository.mockReturnValue(discreteTaskRepositoryMocks);
    getPartialTaskRepository.mockReturnValue(partialTaskRepositoryMocks);
    partialTaskManager = new PartialTaskManager({ log: jest.fn() }, connectionManagerMock);
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Create resource', function () {
    it('Creates a partial task', async function () {
      const partialCreateMock = partialTaskRepositoryMocks.createPartialTask;
      partialCreateMock.mockResolvedValue(partialTaskCreate.response);

      const response = await partialTaskManager.createResource(partialTaskCreate.params);

      expect(response).toEqual(partialTaskCreate.response);
      expect(partialCreateMock).toHaveBeenCalledTimes(1);
      expect(partialCreateMock).toHaveBeenCalledWith(partialTaskCreate.params);
    });
  });

  describe('Get resource', function () {
    it('Gets an existing partial task', async function () {
      const partialExistsMock = partialTaskRepositoryMocks.exists;
      const partialGetMock = partialTaskRepositoryMocks.get;
      partialExistsMock.mockResolvedValue(true);
      partialGetMock.mockResolvedValue(partialTaskGet.response);

      const response = await partialTaskManager.getPartialTask(partialTaskGet.params);

      expect(response).toEqual(partialTaskGet.response);
      expect(partialExistsMock).toHaveBeenCalledTimes(1);
      expect(partialExistsMock).toHaveBeenCalledWith(partialTaskGet.params);
      expect(partialGetMock).toHaveBeenCalledTimes(1);
      expect(partialGetMock).toHaveBeenCalledWith(partialTaskGet.params);
    });

    it('Fails to get non existing partial task', async function () {
      const partialExistsMock = partialTaskRepositoryMocks.exists;
      partialExistsMock.mockResolvedValue(false);

      try {
        expect(await partialTaskManager.getPartialTask(partialTaskGetError.params)).toThrowError();
      } catch {}

      expect(partialExistsMock).toHaveBeenCalledTimes(1);
      expect(partialExistsMock).toHaveBeenCalledWith(partialTaskGetError.params);
    });
  });

  describe('Get partial tasks by discrete', function () {
    it('Gets all partial tasks by discrete', async function () {
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      discreteExistsMock.mockResolvedValue(true);

      const partialGetAllMock = partialTaskRepositoryMocks.getAll;
      partialGetAllMock.mockResolvedValue(partialTaskGetByDiscrete.response);

      const response = await partialTaskManager.getPartialTasksByDiscrete(partialTaskGetByDiscrete.params, SearchOrder.DESC);

      expect(response).toEqual(partialTaskGetByDiscrete.response);
      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenCalledWith(partialTaskGetByDiscrete.params);
      expect(partialGetAllMock).toHaveBeenCalledTimes(1);
      expect(partialGetAllMock).toHaveBeenCalledWith(partialTaskGetByDiscrete.params, SearchOrder.DESC);
    });

    it('Fails to get all partial tasks by non existing discrete', async function () {
      const discreteExistsMock = discreteTaskRepositoryMocks.exists;
      discreteExistsMock.mockResolvedValue(false);

      try {
        expect(await partialTaskManager.getPartialTasksByDiscrete(partialTaskGetByDiscrete.params, SearchOrder.DESC)).toThrowError();
      } catch {}

      expect(discreteExistsMock).toHaveBeenCalledTimes(1);
      expect(discreteExistsMock).toHaveBeenLastCalledWith(partialTaskGetByDiscrete.params);
    });
  });

  //   describe('Update resource', function () {
  //     it('Updates an existing discrete task', async function () {
  //       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
  //       const discreteUpdateMock = discreteTaskRepositoryMocks.updateDiscreteTask;
  //       discreteExistsMock.mockResolvedValue(true);
  //       discreteUpdateMock.mockResolvedValue(discreteTaskUpdateCompleted.response);

  //       const response = await discreteTaskManager.updateDiscreteTask({
  //         ...discreteTaskUpdateCompleted.params,
  //         ...discreteTaskUpdateCompleted.body,
  //       });

  //       expect(response).toEqual(discreteTaskUpdateCompleted.response);
  //       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
  //       expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskUpdateCompleted.params);
  //     });

  //     it('Fails to update non existing discrete task', async function () {
  //       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
  //       discreteExistsMock.mockResolvedValue(false);

  //       try {
  //         expect(
  //           await discreteTaskManager.updateDiscreteTask({
  //             ...discreteTaskUpdateError.params,
  //             ...discreteTaskUpdateError.body,
  //           })
  //         ).toThrowError();
  //       } catch {}

  //       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
  //       expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskUpdateError.params);
  //     });
  //   });

  //   describe('Delete resource', function () {
  //     it('Deletes a discrete task', async function () {
  //       const discreteGetMock = discreteTaskRepositoryMocks.get;
  //       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
  //       const discreteDeleteMock = discreteTaskRepositoryMocks.deleteDiscreteTask;
  //       discreteGetMock.mockResolvedValue(discreteTaskDelete.response);
  //       discreteExistsMock.mockResolvedValue(discreteTaskDelete.existsResponse);
  //       discreteDeleteMock.mockResolvedValue(discreteTaskDelete.response);

  //       const partialGetAllMock = partialTaskRepositoryMocks.getAll;
  //       partialGetAllMock.mockResolvedValue([]);

  //       const response = await discreteTaskManager.deleteDiscreteTask(discreteTaskDelete.params);

  //       expect(response).toEqual(discreteTaskDelete.response);
  //       expect(discreteGetMock).toHaveBeenCalledTimes(1);
  //       expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskDelete.params);
  //       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
  //       expect(discreteExistsMock).toHaveBeenCalledWith(discreteTaskDelete.params);
  //       expect(discreteDeleteMock).toHaveBeenCalledTimes(1);
  //       expect(discreteDeleteMock).toHaveBeenCalledWith(discreteTaskDelete.params);
  //     });

  //     it('Fails to delete non existing discrete task', async function () {
  //       const discreteGetMock = discreteTaskRepositoryMocks.get;
  //       discreteGetMock.mockResolvedValue(undefined);

  //       try {
  //         expect(await discreteTaskManager.deleteDiscreteTask(discreteTaskDeleteError.params)).toThrowError();
  //       } catch {}

  //       expect(discreteGetMock).toHaveBeenCalledTimes(1);
  //       expect(discreteGetMock).toHaveBeenCalledWith(discreteTaskDeleteError.params);
  //     });
  //   });
  // });
});
