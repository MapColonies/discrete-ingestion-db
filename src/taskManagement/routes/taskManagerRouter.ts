import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { TaskManagementController } from '../controllers/taskManagementController';

const taskManagerRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const tasksManagementController = dependencyContainer.resolve(TaskManagementController);

  router.post('/:jobType/:taskType/startPending', tasksManagementController.retrieveAndStart);
  router.post('/findInactive', tasksManagementController.findInactiveTasks);
  router.post('/releaseInactive', tasksManagementController.releaseInactive);

  return router;
};

export { taskManagerRouterFactory };
