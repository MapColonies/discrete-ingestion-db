import { ConnectionManager } from 'typeorm';
import { DiscreteTaskManager } from '../../src/discreteTask/models/discreteTaskManager';

let discreteTaskManager: DiscreteTaskManager;

const isConnectedMock = jest.fn();
const initMock = jest.fn();
const getLayerHistoryRepository = jest.fn();
const connectionManagerMock = ({
  isConnected: isConnectedMock,
  init: initMock,
  getLayerHistoryRepository: getLayerHistoryRepository,
} as unknown) as ConnectionManager;
