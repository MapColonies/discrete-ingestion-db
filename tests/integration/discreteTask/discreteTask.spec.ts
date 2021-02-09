import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { DiscreteTaskRepository } from '../../../src/DAL/repositories/discreteTaskRepository';
import { registerTestValues } from '../testContainerConfig';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import { IDiscreteTaskResponse, IDiscreteTaskSave, IPartialTaskResponse } from '../../../src/common/interfaces';
import { PartialTaskRepository } from '../../../src/DAL/repositories/partialTaskRepository';
import { SearchOrder } from '../../../src/common/constants';
import * as requestSender from './helpers/requestSender';
import { discreteTaskCreateOk, discreteTaskGetAll, discreteTaskGetOk, discreteTaskUpdateCompleted } from './helpers/data';

let discreteTaskRepositoryMocks: RepositoryMocks;
let partialTaskRepositoryMocks: RepositoryMocks;

describe('Status', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    discreteTaskRepositoryMocks = registerRepository(DiscreteTaskRepository, new DiscreteTaskRepository());
    partialTaskRepositoryMocks = registerRepository(PartialTaskRepository, new PartialTaskRepository());
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should create discrete task and return 201 status code and the created partial task ids', async function () {
      const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
      discreteSaveMock.mockResolvedValue(discreteTaskCreateOk.response);

      const partialSaveMock = partialTaskRepositoryMocks.saveMock;

      discreteTaskCreateOk.response.forEach((taskId) => {
        partialSaveMock.mockReturnValueOnce({ id: taskId } as IPartialTaskResponse);
      });

      const response = await requestSender.createResource(
        discreteTaskCreateOk.params.id,
        discreteTaskCreateOk.params.version,
        discreteTaskCreateOk.body
      );

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(discreteSaveMock).toHaveBeenCalledTimes(1);
      expect(discreteSaveMock).toHaveBeenCalledWith({
        ...discreteTaskCreateOk.params,
        metadata: discreteTaskCreateOk.body.metadata,
      } as IDiscreteTaskSave);

      expect(partialSaveMock).toHaveBeenCalledTimes(discreteTaskCreateOk.response.length);

      const status = response.body as string[];
      expect(status).toEqual(discreteTaskCreateOk.response);
    });

    it('should get all discrete tasks and return 200', async function () {
      const discreteFindMock = discreteTaskRepositoryMocks.findMock;
      discreteFindMock.mockResolvedValue(discreteTaskGetAll.response);

      const response = await requestSender.getAllResources();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(discreteFindMock).toHaveBeenCalledTimes(1);
      expect(discreteFindMock).toHaveBeenCalledWith({
        order: { updateDate: SearchOrder.DESC },
        relations: ['tasks'],
      });

      const discreteTasks = response.body as IDiscreteTaskResponse[];
      expect(discreteTasks).toEqual(discreteTaskGetAll.response);
    });

    it('should get discrete task and return 200', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      discreteFindOneMock.mockResolvedValue(discreteTaskGetOk.response);

      const response = await requestSender.getResource(discreteTaskGetOk.params.id, discreteTaskGetOk.params.version);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
      expect(discreteFindOneMock).toHaveBeenCalledWith({
        relations: ['tasks'],
        where: { ...discreteTaskCreateOk.params } as IDiscreteTaskSave,
      });

      const discreteTask = response.body as string[];
      expect(discreteTask).toEqual(discreteTaskGetOk.response);
    });

    it('should update discrete task status and return 200', async function () {
      const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;

      // Save needs to return something
      discreteSaveMock.mockResolvedValue({});
      // Find needs to return something
      discreteFindOneMock.mockResolvedValue({});

      const response = await requestSender.updateResource(
        discreteTaskUpdateCompleted.params.id,
        discreteTaskUpdateCompleted.params.version,
        discreteTaskUpdateCompleted.body
      );

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(discreteSaveMock).toHaveBeenCalledTimes(1);
      expect(discreteSaveMock).toHaveBeenCalledWith({
        ...discreteTaskUpdateCompleted.body,
        ...discreteTaskUpdateCompleted.params,
      });
    });

    // it('should delete discrete task and return 200', async function () {
    //   const discreteDeleteMock = discreteTaskRepositoryMocks.deleteMock;
    //   const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;

    //   const partialDeleteMock = partialTaskRepositoryMocks.deleteMock;
    //   const partialFindOneMock = partialTaskRepositoryMocks.findOneMock;

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
  });

  // describe('Bad Path', function () {
  //   // All requests with status code of 400
  //   it('update should return status code 400 on invalid request', async function () {
  //     const response = await requestSender.updateStatus(({ invalid: 'data' } as unknown) as IStatus);

  //     expect(saveMock).toHaveBeenCalledTimes(0);
  //     expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
  //   });
  // });

  // describe('Sad Path', function () {
  //   // All requests with status code 4XX-5XX
  //   it('get should return status code 500 on db error', async function () {
  //     findOneMock.mockRejectedValue(new Error('test Db error')); //TODO: replace with custom db errors

  //     const response = await requestSender.getStatus();

  //     expect(findOneMock).toHaveBeenCalledTimes(1);
  //     expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
  //   });

  //   it('update should return status code 500 on db error', async function () {
  //     saveMock.mockRejectedValue(new Error('test Db error')); //TODO: replace with custom db errors
  //     const statusReq: IStatus = {
  //       isWatching: true,
  //     };

  //     const response = await requestSender.updateStatus(statusReq);

  //     expect(saveMock).toHaveBeenCalledTimes(1);
  //     expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
  //   });
  // });
});
