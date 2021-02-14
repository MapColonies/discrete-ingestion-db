import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { DiscreteTaskRepository } from '../../../src/DAL/repositories/discreteTaskRepository';
import { registerTestValues } from '../../testContainerConfig';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import {
  IDiscreteTaskParams,
  IDiscreteTaskResponse,
  IDiscreteTaskSave,
  IPartialTaskParams,
  IDiscreteTaskCreate,
} from '../../../src/common/interfaces';
import { PartialTaskRepository } from '../../../src/DAL/repositories/partialTaskRepository';
import { SearchOrder } from '../../../src/common/constants';
import * as requestSender from './helpers/requestSender';
import {
  discreteTaskGetError,
  discreteTaskCreateOk,
  discreteTaskDelete,
  discreteTaskGetAll,
  discreteTaskGetOk,
  discreteTaskUpdateCompleted,
  discreteTaskPutError,
  discreteTaskPostError,
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
    it('should create discrete task and return status code 201 and the created partial task ids', async function () {
      const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
      discreteSaveMock.mockResolvedValue(discreteTaskCreateOk.response);

      const partialSaveMock = partialTaskRepositoryMocks.saveMock;

      discreteTaskCreateOk.response.forEach((taskId) => {
        partialSaveMock.mockReturnValueOnce({ id: taskId } as IPartialTaskParams);
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

    it('should delete discrete task and return 200', async function () {
      const discreteDeleteMock = discreteTaskRepositoryMocks.deleteMock;
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      discreteDeleteMock.mockResolvedValue({});
      discreteFindOneMock.mockResolvedValue({});

      const partialFindOndeMock = partialTaskRepositoryMocks.findOneMock;
      const partialDeleteMock = partialTaskRepositoryMocks.deleteMock;
      const partialGetManyMock = partialTaskRepositoryMocks.queryBuilder.getMany;
      partialFindOndeMock.mockResolvedValue({});
      partialDeleteMock.mockResolvedValue({});
      partialGetManyMock.mockResolvedValue(discreteTaskDelete.taskResponse);

      const response = await requestSender.deleteResource(discreteTaskDelete.params.id, discreteTaskDelete.params.version);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(discreteDeleteMock).toHaveBeenCalledTimes(1);
      expect(discreteDeleteMock).toHaveBeenCalledWith(discreteTaskDelete.params as IDiscreteTaskParams);

      expect(partialFindOndeMock).toHaveBeenCalledTimes(discreteTaskDelete.taskResponse.length);
      discreteTaskDelete.taskResponse.forEach((task, index) => {
        expect(partialFindOndeMock).toHaveBeenNthCalledWith(index + 1, discreteTaskDelete.taskResponse[index]);
      });
      expect(partialDeleteMock).toHaveBeenCalledTimes(discreteTaskDelete.taskResponse.length);
      discreteTaskDelete.taskResponse.forEach((task, index) => {
        expect(partialDeleteMock).toHaveBeenNthCalledWith(index + 1, { id: task.id } as IPartialTaskParams);
      });
      expect(partialGetManyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bad Path', function () {
    it('should return status code 400 on PUT request with no body', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      const response = await requestSender.updateResourceNoBody(discreteTaskPutError.params.id, discreteTaskPutError.params.version);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(discreteFindOneMock).toHaveBeenCalledTimes(0);
    });

    it('should return status code 400 on POST request with no body', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      const response = await requestSender.createResourceNoBody(discreteTaskPostError.params.id, discreteTaskPostError.params.version);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(discreteFindOneMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on GET request for non existing discrete task', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      discreteFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getResource(discreteTaskGetError.params.id, discreteTaskGetError.params.version);

      expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
      expect(discreteFindOneMock).toHaveBeenCalledWith({
        relations: ['tasks'],
        where: { ...discreteTaskGetError.params } as IDiscreteTaskSave,
      });
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      // TODO: replace when error handling is added
      // expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on PUT request for non existing discrete task', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
      discreteFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.updateResource(
        discreteTaskPutError.params.id,
        discreteTaskPutError.params.version,
        discreteTaskPutError.body
      );

      expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
      expect(discreteFindOneMock).toHaveBeenCalledWith({
        relations: ['tasks'],
        where: { ...discreteTaskPutError.params } as IDiscreteTaskSave,
      });
      expect(discreteSaveMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      // TODO: replace when error handling is added
      // expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on DELETE request for non existing discrete task', async function () {
      const discreteFindOneMock = discreteTaskRepositoryMocks.findOneMock;
      const discreteDeleteMock = discreteTaskRepositoryMocks.deleteMock;
      discreteFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.deleteResource(discreteTaskPostError.params.id, discreteTaskPostError.params.version);

      expect(discreteFindOneMock).toHaveBeenCalledTimes(1);
      expect(discreteFindOneMock).toHaveBeenCalledWith({
        relations: ['tasks'],
        where: { ...discreteTaskPostError.params } as IDiscreteTaskSave,
      });
      expect(discreteDeleteMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      // TODO: replace when error handling is added
      // expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 409 on POST request for existing discrete task', async function () {
      const discreteSaveMock = discreteTaskRepositoryMocks.saveMock;
      discreteSaveMock.mockResolvedValue(undefined);

      const response = await requestSender.createResource(
        discreteTaskPostError.params.id,
        discreteTaskPostError.params.version,
        discreteTaskPostError.body
      );

      expect(discreteSaveMock).toHaveBeenCalledTimes(1);
      expect(discreteSaveMock).toHaveBeenCalledWith({
        ...discreteTaskPostError.params,
        metadata: discreteTaskPostError.body.metadata,
      } as IDiscreteTaskCreate);
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      // TODO: replace when error handling is added
      // expect(response.status).toBe(httpStatusCodes.CONFLICT);
    });
  });
});
