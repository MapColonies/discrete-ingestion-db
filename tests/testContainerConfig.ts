import { container } from 'tsyringe';
import config from 'config';
import { Services } from '../src/common/constants';
import { logger } from './mocks/Logger';

function registerTestValues(): void {
  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });
}

export { registerTestValues };
