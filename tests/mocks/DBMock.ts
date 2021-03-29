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

interface QueryBuilder {
  where: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
}

interface RepositoryMocks {
  findOneMock: jest.Mock;
  findMock: jest.Mock;
  saveMock: jest.Mock;
  deleteMock: jest.Mock;
  countMock: jest.Mock;
  queryBuilderMock: jest.Mock;
  queryBuilder: QueryBuilder;
}

const registerRepository = <T>(key: ObjectType<T>, instance: T): RepositoryMocks => {
  const repo = (instance as unknown) as Repository<ObjectLiteral>;
  const mocks = {
    findOneMock: jest.fn(),
    findMock: jest.fn(),
    saveMock: jest.fn(),
    deleteMock: jest.fn(),
    countMock: jest.fn(),
    queryBuilderMock: jest.fn(),
    queryBuilder: {
      where: jest.fn(),
      orderBy: jest.fn(),
      getMany: jest.fn(),
    },
  };
  repo.findOne = mocks.findOneMock;
  repo.find = mocks.findMock;
  repo.save = mocks.saveMock;
  repo.delete = mocks.deleteMock;
  repo.count = mocks.countMock;
  (repo.createQueryBuilder as unknown) = mocks.queryBuilderMock;

  // Set query builder mocks
  mocks.queryBuilderMock.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.where.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.orderBy.mockImplementation(() => mocks.queryBuilder);

  repositories[key.name] = repo;
  return mocks;
};

//decorator mocks
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const Generated = () => jest.fn();

//interfaces
export { RepositoryMocks };
//initializers
export { registerRepository, initTypeOrmMocks };
//mocks
export { createConnection };
//decorator mocks
export { Generated };
