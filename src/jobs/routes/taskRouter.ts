import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { TaskController } from '../controllers/taskController';

const taskRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const tasksController = dependencyContainer.resolve(TaskController);

  router.post('/:jobType/:taskType/startPending', tasksController.retrieveAndStart);

  return router;
};

export { taskRouterFactory };
