import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';
import { IDiscreteTaskRequest, IStatusInfo } from '../../../../src/common/interfaces';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getAllResources(): Promise<supertest.Response> {
  return supertest.agent(app).get('/discrete').set('Content-Type', 'application/json');
}

export async function getResource(id: string, version: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/discrete/${id}/${version}`).set('Content-Type', 'application/json');
}

export async function updateResource(id: string, version: string, body: IStatusInfo): Promise<supertest.Response> {
  return supertest.agent(app).put(`/discrete/${id}/${version}`).set('Content-Type', 'application/json').send(body);
}

export async function createResource(id: string, version: string, body: IDiscreteTaskRequest): Promise<supertest.Response> {
  return supertest.agent(app).post(`/discrete/${id}/${version}`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(id: string, version: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/discrete/${id}/${version}`).set('Content-Type', 'application/json');
}
