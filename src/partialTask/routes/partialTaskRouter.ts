import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { PartialTaskController } from '../controllers/partialTaskController';

const partialTaskRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(PartialTaskController);

  router.get('/:taskId', controller.getPartialTaskById);
  router.get('/discrete/:discreteId/:version', controller.getAllByDiscrete);
  router.get('/status/:discreteId/:version', controller.getStatusesByDiscrete);
  router.put('/:taskId', controller.updateResource);

  return router;
};

export { partialTaskRouterFactory };
