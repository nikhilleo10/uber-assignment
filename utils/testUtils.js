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
  requestRideMock.findAndCountAll = (query) => {
    if(query) {
      const includedModelName = query.include[0].model.name;
      const arr = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 10; i++) {
        if(includedModelName === 'incomplete_rides') {
          arr.push(mockData.MOCK_INCOMPLETE_RIDES);
        } else {
          arr.push(mockData.MOCK_COMPLETED_RIDES)
        }
      }
      return {
        count: 10,
        rows: arr
      }
    } else {
      const arr = []
      for (let i = 0; i < 10; i++) {
        arr.push(mockData.MOCK_REQUESTED_RIDES)
      }
      return {
        count: 10,
        rows: arr
      }
    }
  }
  requestRideMock.update = () => {
    return true
  };

  const completedRideMock = DBConnectionMock.define('completed_rides', mockData.MOCK_COMPLETED_RIDES, {
    instanceMethods: {
      update: () => {
        return {
          ...mockData.MOCK_COMPLETED_RIDES,
          tripStatus: TRIP_STATUS_TYPES.ASSIGNED,
          driverId: 1
        }
      }
    }
  });
  completedRideMock.findByPk = (query) => completedRideMock.findById(query);
  completedRideMock.create = () => mockData.MOCK_REQUESTED_RIDES;
  completedRideMock.findOne = () => completedRideMock;
  completedRideMock.findAndCountAll = () => {
    const arr = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      arr.push(mockData.MOCK_COMPLETED_RIDES);
    }
    return {
      count: 10,
      rows: arr
    }
  }
  completedRideMock.update = () => {
    return mockData.MOCK_COMPLETED_RIDES
  };

  const incompleteRideMock = DBConnectionMock.define('incomplete_rides', mockData.MOCK_INCOMPLETE_RIDES, {
    instanceMethods: {
      update: () => {
        return {
          ...mockData.MOCK_COMPLETED_RIDES,
          tripStatus: TRIP_STATUS_TYPES.ASSIGNED,
          driverId: 1
        }
      }
    }
  });
  incompleteRideMock.findByPk = (query) => incompleteRideMock.findById(query);
  incompleteRideMock.create = () => mockData.MOCK_INCOMPLETE_RIDES;
  incompleteRideMock.findOne = () => incompleteRideMock;
  incompleteRideMock.findAndCountAll = () => {
    const arr = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      arr.push(mockData.MOCK_INCOMPLETE_RIDES);
    }
    return {
      count: 10,
      rows: arr
    }
  }

  incompleteRideMock.update = () => {
    return true
  };

  return {
    users: userMock,
    vehicles: vehicleMock,
    drivers: driverMock,
    requestedRides: requestRideMock,
    completedRides: completedRideMock,
    incompleteRides: incompleteRideMock,
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
