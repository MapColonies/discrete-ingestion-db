import { ILogger } from '../../src/common/interfaces';

const logMock = jest.fn();
const logger: ILogger = {
  log: logMock,
};

export { logMock, logger };
