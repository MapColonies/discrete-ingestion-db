import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { DiscreteTaskRepository } from '../../../src/DAL/repositories/discreteTaskRepository';
import { DiscreteTaskManager } from '../../../src/discreteTask/models/discreteTaskManager';
import { registerTestValues } from '../../testContainerConfig';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import {
  IDiscreteTaskParams,
  IDiscreteTaskResponse,
  IDiscreteTaskSave,
  IPartialTaskParams,
  IDiscreteTaskCreate,
} from '../../../src/common/interfaces';
import { SearchOrder } from '../../../src/common/constants';
import { discreteTaskCreate } from './helpers/data';
import { ConnectionManager } from '../../../src/DAL/connectionManager';
import { PartialTaskRepository } from '../../../src/DAL/repositories/partialTaskRepository';

// let discreteTaskRepositoryMocks: RepositoryMocks;
// let partialTaskRepositoryMocks: RepositoryMocks;
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

// const getMock = jest.fn();
// const upsertMock = jest.fn();
// const existsMock = jest.fn();
const discreteTaskRepositoryMocks = {
  createDiscreteTask: jest.fn(),
  getAll: jest.fn(),
  get: jest.fn(),
  deleteDiscreteTask: jest.fn(),
  updateDiscreteTask: jest.fn(),
  exists: jest.fn(),
};

const partialTaskRepositoryMocks = {
  get: jest.fn(),
  upsert: jest.fn(),
  exists: jest.fn(),
};

describe('Discrete task manager', function () {
  beforeEach(() => {
    registerTestValues();
    initTypeOrmMocks();
    // discreteTaskRepositoryMocks = registerRepository(DiscreteTaskRepository, new DiscreteTaskRepository());
    // partialTaskRepositoryMocks = registerRepository(PartialTaskRepository, new PartialTaskRepository());
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
      const discreteSaveMock = discreteTaskRepositoryMocks.createDiscreteTask;
      discreteSaveMock.mockResolvedValue(discreteTaskCreate.response);

      const response = await discreteTaskManager.createResource(discreteTaskCreate.params);

      expect(response).toEqual([]);
      expect(discreteSaveMock).toHaveBeenCalledTimes(1);
      expect(discreteSaveMock).toHaveBeenCalledWith(discreteTaskCreate.params);
    });

    // it('should get all discrete tasks and return 200', async function () {
    //   const discreteFindMock = discreteTaskRepositoryMocks.findMock;
    //   discreteFindMock.mockResolvedValue(discreteTaskGetAll.response);

    //   const response = await requestSender.getAllResources();

    //   expect(response.status).toBe(httpStatusCodes.OK);
    //   expect(discreteFindMock).toHaveBeenCalledTimes(1);
    //   expect(discreteFindMock).toHaveBeenCalledWith({
    //     order: { updateDate: SearchOrder.DESC },
    //     relations: ['tasks'],
    //   });

    //   const discreteTasks = response.body as IDiscreteTaskResponse[];
    //   expect(discreteTasks).toEqual(discreteTaskGetAll.response);
    // });

    // it('should get discrete task and return 200', async function () {
    //   const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
    //   discreteFindOneMock.mockResolvedValue(discreteTaskGetOk.response);

    //   const response = await requestSender.getResource(discreteTaskGetOk.params.id, discreteTaskGetOk.params.version);

    //   expect(response.status).toBe(httpStatusCodes.OK);
    //   expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
    //   expect(discreteFindOneMock).toHaveBeenCalledWith({
    //     relations: ['tasks'],
    //     where: { ...discreteTaskCreateOk.params } as IDiscreteTaskSave,
    //   });

    //   const discreteTask = response.body as string[];
    //   expect(discreteTask).toEqual(discreteTaskGetOk.response);
    // });

    // it('should update discrete task status and return 200', async function () {
    //   const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
    //   const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;

    //   // Save needs to return something
    //   discreteSaveMock.mockResolvedValue({});
    //   // Find needs to return something
    //   discreteFindOneMock.mockResolvedValue({});

    //   const response = await requestSender.updateResource(
    //     discreteTaskUpdateCompleted.params.id,
    //     discreteTaskUpdateCompleted.params.version,
    //     discreteTaskUpdateCompleted.body
    //   );

    //   expect(response.status).toBe(httpStatusCodes.OK);
    //   expect(discreteSaveMock).toHaveBeenCalledTimes(1);
    //   expect(discreteSaveMock).toHaveBeenCalledWith({
    //     ...discreteTaskUpdateCompleted.body,
    //     ...discreteTaskUpdateCompleted.params,
    //   });
    // });

    // it('should delete discrete task and return 200', async function () {
    //   const discreteDeleteMock = discreteTaskRepositoryMocks.deleteMock;
    //   const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
    //   discreteDeleteMock.mockResolvedValue({});
    //   discreteFindOneMock.mockResolvedValue({});

    //   const partialDeleteMock = partialTaskRepositoryMocks.deleteMock;
    //   const partialGetManyMock = partialTaskRepositoryMocks.queryBuilder.getMany;
    //   partialDeleteMock.mockResolvedValue({});
    //   partialGetManyMock.mockResolvedValue(discreteTaskDelete.taskResponse);

    //   const response = await requestSender.deleteResource(discreteTaskDelete.params.id, discreteTaskDelete.params.version);

    //   expect(response.status).toBe(httpStatusCodes.OK);
    //   expect(discreteDeleteMock).toHaveBeenCalledTimes(1);
    //   expect(discreteDeleteMock).toHaveBeenCalledWith(discreteTaskDelete.params as IDiscreteTaskParams);

    //   expect(partialDeleteMock).toHaveBeenCalledTimes(discreteTaskDelete.taskResponse.length);
    //   discreteTaskDelete.taskResponse.forEach((task, index) => {
    //     expect(partialDeleteMock).toHaveBeenNthCalledWith(index + 1, { id: task.id } as IPartialTaskParams);
    //   });
    // });
  });
});
