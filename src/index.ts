// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Probe } from '@map-colonies/mc-probe';
import config from 'config';
import { container } from 'tsyringe';
import { getApp } from './app';
import { DEFAULT_SERVER_PORT } from './common/constants';

interface IServerConfig {
  port: string;
}

const serverConfig = config.get<IServerConfig>('server');
const port: number = parseInt(serverConfig.port) || DEFAULT_SERVER_PORT;
const app = getApp();
const probe = container.resolve<Probe>(Probe);
void probe.start(app, port).then(() => {
  probe.readyFlag = true;
});
