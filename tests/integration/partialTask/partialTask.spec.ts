import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { DiscreteTaskRepository } from '../../../src/DAL/repositories/discreteTaskRepository';
import { registerTestValues } from '../../testContainerConfig';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import { IDiscreteTaskParams, IPartialTaskResponse } from '../../../src/common/interfaces';
import { PartialTaskRepository } from '../../../src/DAL/repositories/partialTaskRepository';
import * as requestSender from './helpers/requestSender';
import {
  partialTaskGetAll,
  partialTaskGetAllError,
  partialTaskGetOk,
  partialTaskPutError,
  partialTaskUpdateCompleted,
  partialTaskGetError,
} from './helpers/data';

let discreteTaskRepositoryMocks: RepositoryMocks;
let partialTaskRepositoryMocks: RepositoryMocks;

describe('Discrete task', function () {
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
    it('should get partial task and return 200', async function () {
      const partialFindOneMock = partialTaskRepositoryMocks.findOneMock;
      partialFindOneMock.mockResolvedValue(partialTaskGetOk.response);

      const response = await requestSender.getPartialTaskById(partialTaskGetOk.params.id);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(partialFindOneMock).toHaveBeenCalledTimes(2);
      expect(partialFindOneMock).toHaveBeenCalledWith(partialTaskGetOk.params);

      const partialTask = response.body as IPartialTaskResponse;
      expect(partialTask).toEqual(partialTaskGetOk.response);
    });

    it('should get all partial tasks and return 200', async function () {
      const partialGetManyMock = partialTaskRepositoryMocks.queryBuilder.getMany;
      partialGetManyMock.mockResolvedValue(partialTaskGetAll.response);

      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      discreteFindOneMock.mockResolvedValue({});

      const response = await requestSender.getAllByDiscrete(partialTaskGetAll.params.id, partialTaskGetAll.params.version);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(partialGetManyMock).toHaveBeenCalledTimes(1);

      const discreteTasks = response.body as IPartialTaskResponse[];
      expect(discreteTasks).toEqual(partialTaskGetAll.response);
    });

    it('should update partial task status and return 200', async function () {
      const partialGetManyMock = partialTaskRepositoryMocks.findOneMock;
      const partialSaveMock = partialTaskRepositoryMocks.saveMock;
      partialGetManyMock.mockResolvedValue({});
      partialSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource(partialTaskUpdateCompleted.params.id, partialTaskUpdateCompleted.body);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(partialSaveMock).toHaveBeenCalledTimes(1);
      expect(partialSaveMock).toHaveBeenCalledWith({
        ...partialTaskUpdateCompleted.body,
        ...partialTaskUpdateCompleted.params,
      });
    });
  });

  describe('Bad Path', function () {
    it('should return status code 400 on PUT request with no body', async function () {
      const partialFindOneMock = partialTaskRepositoryMocks.findOneMock;
      const response = await requestSender.updateResourceNoBody(partialTaskPutError.params.id);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(partialFindOneMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on GET request for partial tasks because of non existing discrete task', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      discreteFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getAllByDiscrete(partialTaskGetAllError.params.id, partialTaskGetAllError.params.version);

      expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
      expect(discreteFindOneMock).toHaveBeenCalledWith({
        relations: ['tasks'],
        where: { ...partialTaskGetAllError.params } as IDiscreteTaskParams,
      });
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on GET request for non existing partial task', async function () {
      const partialFindOneMock = partialTaskRepositoryMocks.findOneMock;
      partialFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getPartialTaskById(partialTaskGetError.params.id);

      expect(partialFindOneMock).toHaveBeenCalledTimes(1);
      expect(partialFindOneMock).toHaveBeenCalledWith(partialTaskGetError.params);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on PUT request for non existing partial task', async function () {
      const partialFindOneMock = partialTaskRepositoryMocks.findOneMock;
      partialFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.updateResource(partialTaskPutError.params.id, partialTaskPutError.body);

      expect(partialFindOneMock).toHaveBeenCalledTimes(1);
      expect(partialFindOneMock).toHaveBeenCalledWith(partialTaskPutError.params);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });
  });
});
