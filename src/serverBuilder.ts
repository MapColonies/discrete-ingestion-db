import express from 'express';
import bodyParser from 'body-parser';
import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';
import { container, inject, injectable } from 'tsyringe';
import { RequestLogger } from './common/middlewares/RequestLogger';
import { Services } from './common/constants';
import { IConfig, ILogger } from './common/interfaces';
import { discreteTaskRouterFactory } from './discreteTask/routes/discreteTaskRouter';
import { openapiRouterFactory } from './common/routes/openapi';
import { partialTaskRouterFactory } from './partialTask/routes/partialTaskRouter';
import { jobRouterFactory } from './job/routes/jobRouter';
import { taskRouterFactory } from './task/routes/taskRouter';

@injectable()
export class ServerBuilder {
  private readonly serverInstance = express();

  public constructor(
    @inject(Services.CONFIG) private readonly config: IConfig,
    private readonly requestLogger: RequestLogger,
    @inject(Services.LOGGER) private readonly logger: ILogger
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerPreRoutesMiddleware();
    this.buildRoutes();
    this.registerPostRoutesMiddleware();

    return this.serverInstance;
  }

  private buildRoutes(): void {
    this.serverInstance.use('/discrete', discreteTaskRouterFactory(container));
    this.serverInstance.use('/task', partialTaskRouterFactory(container));

    this.serverInstance.use('/jobs/:jobId/tasks', taskRouterFactory(container));
    this.serverInstance.use('/jobs', jobRouterFactory(container));
    this.serverInstance.use('/', openapiRouterFactory(container));
  }

  private registerPreRoutesMiddleware(): void {
    this.serverInstance.use(bodyParser.json());

    const ignorePathRegex = new RegExp(`^${this.config.get<string>('openapiConfig.basePath')}/.*`, 'i');
    const apiSpecPath = this.config.get<string>('openapiConfig.filePath');
    this.serverInstance.use(OpenApiMiddleware({ apiSpec: apiSpecPath, validateRequests: true, ignorePaths: ignorePathRegex }));

    this.serverInstance.use(this.requestLogger.getLoggerMiddleware());
  }

  private registerPostRoutesMiddleware(): void {
    this.serverInstance.use(getErrorHandlerMiddleware((message) => this.logger.log('error', message)));
  }
}
