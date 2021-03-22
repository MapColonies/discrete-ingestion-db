import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { TaskController } from '../controllers/taskController';

const taskRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(TaskController);

  router.get('/', controller.getResources);
  router.get('/:taskId', controller.getResource);
  router.put('/:taskId', controller.updateResource);
  router.post('/:taskId', controller.createResource);
  router.delete('/:taskId', controller.deleteResource);

  return router;
};

export { taskRouterFactory };
