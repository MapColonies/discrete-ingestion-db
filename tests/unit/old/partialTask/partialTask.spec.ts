// import { container } from 'tsyringe';
// import { registerTestValues } from '../../testContainerConfig';
// import { initTypeOrmMocks } from '../../mocks/DBMock';
// import { ConnectionManager } from '../../../src/DAL/connectionManager';
// import { PartialTaskManager } from '../../../src/partialTask/models/partialTaskManager';
// import { SearchOrder } from '../../../src/common/constants';
// import { EntityGetError, EntityUpdateError } from '../../../src/common/errors';
// import {
//   partialTaskCreate,
//   partialTaskGet,
//   partialTaskGetError,
//   partialTaskGetByDiscrete,
//   partialTaskUpdateCompleted,
//   partialTaskUpdateError,
//   partialTaskDelete,
//   partialTaskDeleteError,
//   partialTaskGetStatusCountByDiscrete,
// } from './helpers/data';

// let partialTaskManager: PartialTaskManager;

// const isConnectedMock = jest.fn();
// const initMock = jest.fn();
// const getDiscreteTaskRepository = jest.fn();
// const getPartialTaskRepository = jest.fn();
// const connectionManagerMock = ({
//   isConnected: isConnectedMock,
//   init: initMock,
//   getDiscreteTaskRepository: getDiscreteTaskRepository,
//   getPartialTaskRepository: getPartialTaskRepository,
// } as unknown) as ConnectionManager;

// const discreteTaskRepositoryMocks = {
//   createDiscreteTask: jest.fn(),
//   getAll: jest.fn(),
//   get: jest.fn(),
//   deleteDiscreteTask: jest.fn(),
//   updateDiscreteTask: jest.fn(),
//   exists: jest.fn(),
// };

// const partialTaskRepositoryMocks = {
//   createPartialTask: jest.fn(),
//   getAll: jest.fn(),
//   getAllStatuses: jest.fn(),
//   get: jest.fn(),
//   updatePartialTask: jest.fn(),
//   deletePartialTask: jest.fn(),
//   exists: jest.fn(),
//   queryBuilderMock: jest.fn(),
//   queryBuilder: {
//     where: jest.fn(),
//     orderBy: jest.fn(),
//     getMany: jest.fn(),
//     select: jest.fn(),
//     groupBy: jest.fn(),
//     execute: jest.fn(),
//   },
// };

// describe('Discrete task manager', function () {
//   beforeEach(() => {
//     registerTestValues();
//     initTypeOrmMocks();
//     getDiscreteTaskRepository.mockReturnValue(discreteTaskRepositoryMocks);
//     getPartialTaskRepository.mockReturnValue(partialTaskRepositoryMocks);
//     partialTaskManager = new PartialTaskManager({ log: jest.fn() }, connectionManagerMock);
//   });
//   afterEach(function () {
//     container.clearInstances();
//     jest.resetAllMocks();
//   });

//   describe('Create resource', function () {
//     it('Creates a partial task', async function () {
//       const partialCreateMock = partialTaskRepositoryMocks.createPartialTask;
//       partialCreateMock.mockResolvedValue(partialTaskCreate.response);

//       const response = await partialTaskManager.createResource(partialTaskCreate.params);

//       expect(response).toEqual(partialTaskCreate.response);
//       expect(partialCreateMock).toHaveBeenCalledTimes(1);
//       expect(partialCreateMock).toHaveBeenCalledWith(partialTaskCreate.params);
//     });
//   });

//   describe('Get resource', function () {
//     it('Gets an existing partial task', async function () {
//       const partialExistsMock = partialTaskRepositoryMocks.exists;
//       const partialGetMock = partialTaskRepositoryMocks.get;
//       partialExistsMock.mockResolvedValue(true);
//       partialGetMock.mockResolvedValue(partialTaskGet.response);

//       const response = await partialTaskManager.getPartialTask(partialTaskGet.params);

//       expect(response).toEqual(partialTaskGet.response);
//       expect(partialExistsMock).toHaveBeenCalledTimes(1);
//       expect(partialExistsMock).toHaveBeenCalledWith(partialTaskGet.params);
//       expect(partialGetMock).toHaveBeenCalledTimes(1);
//       expect(partialGetMock).toHaveBeenCalledWith(partialTaskGet.params);
//     });

//     it('Fails to get non existing partial task', async function () {
//       const partialExistsMock = partialTaskRepositoryMocks.exists;
//       partialExistsMock.mockResolvedValue(false);

//       try {
//         // TODO: replace with custom error
//         expect(await partialTaskManager.getPartialTask(partialTaskGetError.params)).toThrow(EntityGetError);
//       } catch (err) {
//         jest.fn();
//       }

//       expect(partialExistsMock).toHaveBeenCalledTimes(1);
//       expect(partialExistsMock).toHaveBeenCalledWith(partialTaskGetError.params);
//     });
//   });

//   describe('Get partial tasks by discrete', function () {
//     it('Gets all partial tasks by discrete', async function () {
//       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
//       discreteExistsMock.mockResolvedValue(true);

//       const partialGetAllMock = partialTaskRepositoryMocks.getAll;
//       partialGetAllMock.mockResolvedValue(partialTaskGetByDiscrete.response);

//       const response = await partialTaskManager.getPartialTasksByDiscrete(partialTaskGetByDiscrete.params, SearchOrder.DESC);

//       expect(response).toEqual(partialTaskGetByDiscrete.response);
//       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
//       expect(discreteExistsMock).toHaveBeenCalledWith(partialTaskGetByDiscrete.params);
//       expect(partialGetAllMock).toHaveBeenCalledTimes(1);
//       expect(partialGetAllMock).toHaveBeenCalledWith(partialTaskGetByDiscrete.params, SearchOrder.DESC);
//     });

//     it('Fails to get all partial tasks by non existing discrete', async function () {
//       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
//       discreteExistsMock.mockResolvedValue(false);

//       try {
//         // TODO: replace with custom error
//         expect(await partialTaskManager.getPartialTasksByDiscrete(partialTaskGetByDiscrete.params, SearchOrder.DESC)).toThrow(EntityGetError);
//       } catch (err) {
//         jest.fn();
//       }

//       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
//       expect(discreteExistsMock).toHaveBeenLastCalledWith(partialTaskGetByDiscrete.params);
//     });
//   });

//   describe('Update resource', function () {
//     it('Updates an existing partial task', async function () {
//       const partialExistsMock = partialTaskRepositoryMocks.exists;
//       const partialUpdateMock = partialTaskRepositoryMocks.updatePartialTask;
//       partialExistsMock.mockResolvedValue(true);
//       partialUpdateMock.mockResolvedValue(partialTaskUpdateCompleted.response);

//       const response = await partialTaskManager.updatePartialTask({
//         ...partialTaskUpdateCompleted.params,
//         ...partialTaskUpdateCompleted.body,
//       });

//       expect(response).toEqual(partialTaskUpdateCompleted.response);
//       expect(partialExistsMock).toHaveBeenCalledTimes(1);
//       expect(partialExistsMock).toHaveBeenCalledWith(partialTaskUpdateCompleted.params);
//     });

//     it('Fails to update non existing partial task', async function () {
//       const partialExistsMock = partialTaskRepositoryMocks.exists;
//       partialExistsMock.mockResolvedValue(false);

//       try {
//         // TODO: replace with custom error
//         expect(
//           await partialTaskManager.updatePartialTask({
//             ...partialTaskUpdateError.params,
//             ...partialTaskUpdateError.body,
//           })
//         ).toThrow(EntityUpdateError);
//       } catch (err) {
//         jest.fn();
//       }

//       expect(partialExistsMock).toHaveBeenCalledTimes(1);
//       expect(partialExistsMock).toHaveBeenCalledWith(partialTaskUpdateError.params);
//     });
//   });

//   describe('Delete resource', function () {
//     it('Deletes a partial task', async function () {
//       const partialGetMock = partialTaskRepositoryMocks.get;
//       const partialDeleteMock = partialTaskRepositoryMocks.deletePartialTask;
//       partialGetMock.mockResolvedValue(partialTaskDelete.response);
//       partialDeleteMock.mockResolvedValue(partialTaskDelete.response);

//       const response = await partialTaskManager.deleteResource(partialTaskDelete.params);

//       expect(response).toEqual(partialTaskDelete.response);
//       expect(partialGetMock).toHaveBeenCalledTimes(1);
//       expect(partialGetMock).toHaveBeenCalledWith(partialTaskDelete.params);
//       expect(partialDeleteMock).toHaveBeenCalledTimes(1);
//       expect(partialDeleteMock).toHaveBeenCalledWith(partialTaskDelete.params);
//     });

//     it('Fails to delete non existing partial task', async function () {
//       const partialGetMock = partialTaskRepositoryMocks.get;
//       partialGetMock.mockResolvedValue(partialTaskDeleteError.response);

//       try {
//         // TODO: replace with custom error
//         expect(await partialTaskManager.deleteResource(partialTaskDeleteError.params)).toThrow(Error);
//       } catch (err) {
//         jest.fn();
//       }

//       expect(partialGetMock).toHaveBeenCalledTimes(1);
//       expect(partialGetMock).toHaveBeenCalledWith(partialTaskDeleteError.params);
//     });
//   });

//   describe('Get resource statuses count', function () {
//     it('Gets partial task statuses count by discrete', async function () {
//       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
//       discreteExistsMock.mockResolvedValue(true);

//       const partialGetAllStatusesMock = partialTaskRepositoryMocks.getAllStatuses;
//       partialGetAllStatusesMock.mockResolvedValue(partialTaskGetStatusCountByDiscrete.getAllStatuses);

//       const partialExecuteMock = partialTaskRepositoryMocks.queryBuilder.execute;
//       partialExecuteMock.mockResolvedValue([]);

//       const response = await partialTaskManager.getPartialTaskStatusesByDiscrete(partialTaskGetStatusCountByDiscrete.params);

//       expect(response).toEqual(partialTaskGetStatusCountByDiscrete.response);
//       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
//       expect(discreteExistsMock).toHaveBeenCalledWith(partialTaskGetStatusCountByDiscrete.params);
//       expect(partialGetAllStatusesMock).toHaveBeenCalledTimes(1);
//       expect(partialGetAllStatusesMock).toHaveBeenCalledWith(partialTaskGetStatusCountByDiscrete.params);
//     });

//     it('Fails to get partial task statuses count for non existing discrete task', async function () {
//       const discreteExistsMock = discreteTaskRepositoryMocks.exists;
//       discreteExistsMock.mockResolvedValue(false);

//       try {
//         // TODO: replace with custom error
//         expect(await partialTaskManager.getPartialTaskStatusesByDiscrete(partialTaskGetStatusCountByDiscrete.params)).toThrow(EntityGetError);
//       } catch (err) {
//         jest.fn();
//       }

//       expect(discreteExistsMock).toHaveBeenCalledTimes(1);
//       expect(discreteExistsMock).toHaveBeenCalledWith(partialTaskGetStatusCountByDiscrete.params);
//     });
//   });
// });
