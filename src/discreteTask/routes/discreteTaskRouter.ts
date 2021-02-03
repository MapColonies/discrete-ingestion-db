import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { DiscreteTaskController } from '../controllers/discreteTaskController';

const discreteTaskRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(DiscreteTaskController);

  router.get('/:id/:version', controller.getResource);
  router.put('/:id/:version', controller.updateResource);
  router.post('/:id/:version', controller.createResource);
  router.delete('/:id/:version', controller.deleteResource);

  return router;
};

export { discreteTaskRouterFactory };
