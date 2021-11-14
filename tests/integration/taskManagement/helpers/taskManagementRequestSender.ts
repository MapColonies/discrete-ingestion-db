import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function retrieveAndStart(jobType: string, taskType: string): Promise<supertest.Response> {
  return supertest.agent(app).post(`/tasks/${jobType}/${taskType}/startPending`).set('Content-Type', 'application/json');
}

export async function findInactive(body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/tasks/findInactive`).set('Content-Type', 'application/json').send(body);
}

export async function releaseInactive(body: Record<string, unknown> | string[]): Promise<supertest.Response> {
  return supertest.agent(app).post(`/tasks/releaseInactive`).set('Content-Type', 'application/json').send(body);
}

export async function updateExpiredStatus(): Promise<supertest.Response> {
  return supertest.agent(app).post('/tasks/updateExpiredStatus').send();
}
