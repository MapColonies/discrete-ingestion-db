import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { JobRepository } from '../../../src/DAL/repositories/jobRepository';
import { registerTestValues } from '../../testContainerConfig';
import { JobEntity } from '../../../src/DAL/entity/job';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import * as requestSender from './helpers/jobsRequestSender';

let jobRepositoryMocks: RepositoryMocks;

describe('jobs', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    jobRepositoryMocks = registerRepository(JobRepository, new JobRepository());
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should create job with tasks and return status code 201 and the created job and tasks ids', async function () {
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
        status: 'In-Progress',
      };
      const createJobModel = {
        resourceId: '11',
        version: '12',
        description: '13',
        parameters: {
          d: 14,
        },
        status: 'Pending',
        reason: '15',
        type: '16',
        percentage: 17,
        tasks: [createTaskModel1, createTaskModel2],
      };
      const createJobRes = {
        id: 'jobId',
        taskIds: ['taskId1', 'taskId2'],
      };
      const jobEntity = ({
        ...createJobModel,
        id: 'jobId',
        tasks: [
          { ...createTaskModel1, jobId: 'jobId', id: 'taskId1' },
          { ...createTaskModel2, jobId: 'jobId', id: 'taskId2' },
        ],
      } as unknown) as JobEntity;

      const jobSaveMock = jobRepositoryMocks.saveMock;
      jobSaveMock.mockResolvedValue(jobEntity);

      const response = await requestSender.createResource(createJobModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(jobSaveMock).toHaveBeenCalledTimes(1);
      expect(jobSaveMock).toHaveBeenCalledWith(createJobModel);

      const body = response.body as unknown;
      expect(body).toEqual(createJobRes);
    });

    it('should create job without tasks and return status code 201 and the created job', async function () {
      const createJobModel = {
        resourceId: '11',
        version: '12',
        description: '13',
        parameters: {
          d: 14,
        },
        status: 'Pending',
        reason: '15',
        type: '16',
        percentage: 17,
      };
      const createJobRes = {
        id: 'jobId',
        taskIds: [],
      };
      const jobEntity = ({ ...createJobModel, id: 'jobId', tasks: [] } as unknown) as JobEntity;

      const jobSaveMock = jobRepositoryMocks.saveMock;
      jobSaveMock.mockResolvedValue(jobEntity);

      const response = await requestSender.createResource(createJobModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(jobSaveMock).toHaveBeenCalledTimes(1);
      expect(jobSaveMock).toHaveBeenCalledWith(createJobModel);

      const body = response.body as unknown;
      expect(body).toEqual(createJobRes);
    });

    it('should get all jobs and return 200', async function () {
      const taskModel = {
        jobId: 'jobId',
        id: 'taskId',
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const jobModel = {
        id: 'jobId',
        resourceId: '11',
        version: '12',
        description: '13',
        parameters: {
          d: 14,
        },
        status: 'Pending',
        reason: '15',
        type: '16',
        percentage: 17,
        tasks: [taskModel],
      };
      const jobEntity = (jobModel as unknown) as JobEntity;

      const jobsFindMock = jobRepositoryMocks.findMock;
      jobsFindMock.mockResolvedValue([jobEntity]);

      const response = await requestSender.getResources();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(jobsFindMock).toHaveBeenCalledTimes(1);
      expect(jobsFindMock).toHaveBeenCalledWith({ relations: ['tasks'], where: {} });

      const jobs = response.body as unknown;
      expect(jobs).toEqual([jobModel]);
    });

    it('should not find filtered jobs and return 204', async function () {
      const filter = {
        isCleaned: true,
        resourceId: '1',
        status: 'Pending',
        type: '2',
        version: '3',
      };

      const jobsFindMock = jobRepositoryMocks.findMock;
      jobsFindMock.mockResolvedValue([] as JobEntity[]);

      const response = await requestSender.getResources(filter);

      expect(response.status).toBe(httpStatusCodes.NO_CONTENT);
      expect(jobsFindMock).toHaveBeenCalledTimes(1);
      expect(jobsFindMock).toHaveBeenCalledWith({ relations: ['tasks'], where: filter });
    });

    it('should get specific job and return 200', async function () {
      const taskModel = {
        jobId: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
        id: 'taskId',
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const jobModel = {
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
        resourceId: '11',
        version: '12',
        description: '13',
        parameters: {
          d: 14,
        },
        status: 'Pending',
        reason: '15',
        type: '16',
        percentage: 17,
        tasks: [taskModel],
      };
      const jobEntity = (jobModel as unknown) as JobEntity;

      const jobsFinOneMock = jobRepositoryMocks.findOneMock;
      jobsFinOneMock.mockResolvedValue(jobEntity);

      const response = await requestSender.getResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(jobsFinOneMock).toHaveBeenCalledTimes(1);
      expect(jobsFinOneMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        relations: ['tasks'],
      });

      const job = response.body as unknown;
      expect(job).toEqual(jobModel);
    });

    it('should update job status and return 200', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;
      const jobSaveMock = jobRepositoryMocks.saveMock;

      jobCountMock.mockResolvedValue(1);
      jobSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        status: 'In-Progress',
      });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(jobSaveMock).toHaveBeenCalledTimes(1);
      expect(jobSaveMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
        status: 'In-Progress',
      });
    });

    it('should delete job without tasks and return 200', async function () {
      const jobDeleteMock = jobRepositoryMocks.deleteMock;
      const jobCountMock = jobRepositoryMocks.countMock;
      jobDeleteMock.mockResolvedValue({});
      jobCountMock.mockResolvedValue(1);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(jobDeleteMock).toHaveBeenCalledTimes(1);
      expect(jobDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
    });
  });

  describe('Bad Path', function () {
    it('should return status code 400 on PUT request with invalid body', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        invalidFiled: 'test',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(jobCountMock).toHaveBeenCalledTimes(0);
    });

    it('should return status code 400 on POST request with invalid body', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;
      const response = await requestSender.createResource({
        id: 'invalidFiled',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(jobCountMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on GET request for non existing job', async function () {
      const jobsFindOneMock = jobRepositoryMocks.findOneMock;
      jobsFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(jobsFindOneMock).toHaveBeenCalledTimes(1);
      expect(jobsFindOneMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        relations: ['tasks'],
      });
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on PUT request for non existing job', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;
      const jobSaveMock = jobRepositoryMocks.saveMock;
      jobCountMock.mockResolvedValue(0);

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        status: 'Pending',
      });

      expect(jobCountMock).toHaveBeenCalledTimes(1);
      expect(jobCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(jobSaveMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on DELETE request for non existing job', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;
      const jobDeleteMock = jobRepositoryMocks.deleteMock;
      jobCountMock.mockResolvedValue(0);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(jobCountMock).toHaveBeenCalledTimes(1);
      expect(jobCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(jobDeleteMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 422 on DELETE request for job with tasks', async function () {
      const jobCountMock = jobRepositoryMocks.countMock;
      const jobDeleteMock = jobRepositoryMocks.deleteMock;
      jobCountMock.mockResolvedValue(1);
      jobDeleteMock.mockRejectedValue({
        code: '23503',
      });

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(jobCountMock).toHaveBeenCalledTimes(1);
      expect(jobCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(jobDeleteMock).toHaveBeenCalledTimes(1);
      expect(jobDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
      expect(response.status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
    });
  });
});
