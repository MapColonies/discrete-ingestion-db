import { Repository, ObjectType, ObjectLiteral } from 'typeorm';

//functions
const getCustomRepositoryMock = jest.fn();
const createConnection = jest.fn();

let repositories: {
  [key: string]: unknown;
};

const initTypeOrmMocks = (): void => {
  repositories = {};
  getCustomRepositoryMock.mockImplementation(<T>(key: ObjectType<T>) => {
    return repositories[key.name];
  });
  createConnection.mockReturnValue({
    getCustomRepository: getCustomRepositoryMock,
  });
};

interface RepositoryMocks {
  findOneMock: jest.Mock;
  findMock: jest.Mock;
  saveMock: jest.Mock;
  deleteMock: jest.Mock;
}

const registerRepository = <T>(key: ObjectType<T>, instance: T): RepositoryMocks => {
  const repo = (instance as unknown) as Repository<ObjectLiteral>;
  const mocks = {
    findOneMock: jest.fn(),
    findMock: jest.fn(),
    saveMock: jest.fn(),
    deleteMock: jest.fn(),
  };
  repo.findOne = mocks.findOneMock;
  repo.find = mocks.findMock;
  repo.save = mocks.saveMock;
  repo.delete = mocks.deleteMock;
  repositories[key.name] = repo;
  return mocks;
};

//interfaces
export { RepositoryMocks };
//initializers
export { registerRepository, initTypeOrmMocks };
//mocks
export { createConnection };
