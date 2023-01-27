import { users } from '@models';
import { init } from '../lib/testServer';
import { mockData } from './mockData';
import { DEFAULT_METADATA_OPTIONS, TRIP_STATUS_TYPES } from './constants';
import _ from 'lodash';

export function configDB(metadataOptions = DEFAULT_METADATA_OPTIONS) {
  const SequelizeMock = require('sequelize-mock');
  const DBConnectionMock = new SequelizeMock();

  const vehicleMock = DBConnectionMock.define('vehicles', mockData.MOCK_VEHICLE, {
    instanceMethods: {
      getDriver: function () {
        return this.get('driver');
      }
    }
  });
  vehicleMock.findByPk = (query) => vehicleMock.findById(query);

  const driverMock = DBConnectionMock.define('drivers', mockData.MOCK_DRIVER);
  driverMock.findByPk = (query) => driverMock.findById(query);

  const userMock = DBConnectionMock.define('users', mockData.MOCK_USER);
  userMock.findByPk = (query) => userMock.findById(query);

  const requestRideMock = DBConnectionMock.define('requested_rides', mockData.MOCK_REQUESTED_RIDES, {
    instanceMethods: {
      update: () => {
        return {
          ...mockData.MOCK_REQUESTED_RIDES,
          tripStatus: TRIP_STATUS_TYPES.ASSIGNED,
          driverId: 1
        }
      }
    }
  });
  requestRideMock.findByPk = (query) => requestRideMock.findById(query);
  requestRideMock.create = () => mockData.MOCK_REQUESTED_RIDES;
  requestRideMock.findOne = () => requestRideMock;
  requestRideMock.findAndCountAll = () => {
    const arr = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      arr.push(mockData.MOCK_REQUESTED_RIDES);
    }
    return {
      count: 10,
      rows: arr
    }
  }
  requestRideMock.update = () => {
    return true
  };

  return {
    users: userMock,
    vehicles: vehicleMock,
    drivers: driverMock,
    requestedRides: requestRideMock
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
