import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { JobController } from '../controllers/jobController';

const jobRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(JobController);

  router.get('/', controller.findResource);
  router.get('/:jobId', controller.getResource);
  router.put('/:jobId', controller.updateResource);
  router.post('/:jobId', controller.createResource);
  router.delete('/:jobId', controller.deleteResource);

  return router;
};

export { jobRouterFactory };
