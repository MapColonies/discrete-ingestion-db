import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getAllResources(jobId: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/jobs/${jobId}/tasks`).set('Content-Type', 'application/json');
}

export async function getResource(jobId: string, taskId: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/jobs/${jobId}/tasks/${taskId}`).set('Content-Type', 'application/json');
}

export async function updateResource(jobId: string, taskId: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/jobs/${jobId}/tasks/${taskId}`).set('Content-Type', 'application/json').send(body);
}

export async function createResource(jobId: string, body: Record<string, unknown> | Record<string, unknown>[]): Promise<supertest.Response> {
  return supertest.agent(app).post(`/jobs/${jobId}/tasks`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(jobId: string, taskId: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/jobs/${jobId}/tasks/${taskId}`).set('Content-Type', 'application/json');
}
