import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';
import { IPartialTaskStatusUpdate } from '../../../../src/common/interfaces';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getPartialTaskById(taskId: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/task/${taskId}`).set('Content-Type', 'application/json');
}

export async function getAllByDiscrete(id: string): Promise<supertest.Response> {
  return supertest.agent(app).get('/task').set('Content-Type', 'application/json');
}

export async function updateResource(taskId: string, body: IPartialTaskStatusUpdate): Promise<supertest.Response> {
  return supertest.agent(app).put(`/task/${taskId}`).set('Content-Type', 'application/json').send(body);
}
