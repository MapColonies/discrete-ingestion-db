import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export interface SearchTasksParams {
  resourceId?: string;
  version?: string;
  isCleaned?: boolean;
  status?: string;
  type?: string;
  shouldReturnTasks?: boolean;
  fromDate?: string;
  tillDate?: string;
}

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getResources(params: SearchTasksParams = {}): Promise<supertest.Response> {
  return supertest.agent(app).get('/jobs').query(params).set('Content-Type', 'application/json');
}

export async function getResource(id: string, shouldReturnTasks = true): Promise<supertest.Response> {
  return supertest.agent(app).get(`/jobs/${id}`).query({ shouldReturnTasks }).set('Content-Type', 'application/json');
}

export async function updateResource(id: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/jobs/${id}`).set('Content-Type', 'application/json').send(body);
}

export async function createResource(body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/jobs`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(id: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/jobs/${id}`).set('Content-Type', 'application/json');
}

export async function resettable(id: string): Promise<supertest.Response> {
  return supertest.agent(app).post(`/jobs/${id}/resettable`);
}

export async function reset(id: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/jobs/${id}/reset`).set('Content-Type', 'application/json').send(body);
}
