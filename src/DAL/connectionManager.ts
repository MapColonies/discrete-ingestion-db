import { createConnection, Connection, ObjectType } from 'typeorm';
import { inject, singleton } from 'tsyringe';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Services } from '../common/constants';
import { IConfig, ILogger } from '../common/interfaces';
import { DiscreteTaskRepository } from './repositories/discreteTaskRepository';
import { PartialTaskRepository } from './repositories/partialTaskRepository';

@singleton()
export class ConnectionManager {
  private connection?: Connection;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, @inject(Services.CONFIG) private readonly config: IConfig) {}

  public async init(): Promise<void> {
    const connectionConfig = this.config.get<PostgresConnectionOptions>('typeOrm');
    this.logger.log('info', `connection to database ${connectionConfig.database as string} on ${connectionConfig.host as string}`);

    try {
      this.connection = await createConnection(connectionConfig);
    } catch (err) {
      const errString = JSON.stringify(err);
      this.logger.log('error', `failed to connect to database: ${errString}`);
      //TODO: replace with custom error
      throw err;
    }
  }

  public isConnected(): boolean {
    return this.connection !== undefined;
  }

  public getDiscreteTaskRepository(): DiscreteTaskRepository {
    return this.getRepository(DiscreteTaskRepository);
  }

  public getPartialTaskRepository(): PartialTaskRepository {
    return this.getRepository(PartialTaskRepository);
  }

  private getRepository<T>(repository: ObjectType<T>): T {
    if (!this.isConnected()) {
      const msg = 'failed to send request to database: no open connection';
      this.logger.log('error', msg);
      //TODO: replace with custom error
      throw new Error(msg);
    } else {
      const connection = this.connection as Connection;
      return connection.getCustomRepository(repository);
    }
  }
}
