import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { DiscreteTaskController } from '../../discreteTask/controllers/discreteTaskController';

const discretesRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(DiscreteTaskController);

  router.get('/', controller.getAllResources);

  return router;
};

export { discretesRouterFactory };
