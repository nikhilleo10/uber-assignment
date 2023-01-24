import { users } from '@models';
import { init } from '../lib/testServer';
import { mockData } from './mockData';
import { DEFAULT_METADATA_OPTIONS } from './constants';

export function configDB(metadataOptions = DEFAULT_METADATA_OPTIONS) {
  const SequelizeMock = require('sequelize-mock');
  const DBConnectionMock = new SequelizeMock();

  const vehicleMock = DBConnectionMock.define('vehicle', mockData.MOCK_VEHICLE, {
    instanceMethods: {
      getDriver: function () {
        return this.get('driver');
      }
    }
  });
  vehicleMock.findByPk = (query) => vehicleMock.findById(query);

  const driver = DBConnectionMock.define('driver', mockData.MOCK_DRIVER);
  driver.findByPk = (query) => driver.findById(query);

  const userMock = DBConnectionMock.define('userMock', mockData.MOCK_USER);
  userMock.findByPk = (query) => userMock.findById(query);

  return {
    users: userMock,
    vehicle: vehicleMock,
    driver: driver,
  };
}

export function bustDB() {
  users.sync({ force: true }); // this will clear all the entries in your table.
}

export async function mockDB(
  mockCallback = () => {},
  metadataOptions = DEFAULT_METADATA_OPTIONS,
) {
  jest.doMock('@models', () => {
    const sequelizeData = configDB(metadataOptions);
    if (mockCallback) {
      mockCallback({ models: sequelizeData });
    }
    return { models: sequelizeData };
  });
}

export const resetAndMockDB = async (
  mockDBCallback = () => {},
  metadataOptions = DEFAULT_METADATA_OPTIONS
) => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
  mockDB(mockDBCallback, metadataOptions);
  const server = await init();
  return server;
};
