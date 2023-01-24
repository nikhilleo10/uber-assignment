import { resetAndMockDB } from '@utils/testUtils';
import { mockData } from '@utils/mockData';
import _ from 'lodash';
import QueryString from 'qs';
import { TYPE_OF_VEHICLES } from '@utils/constants';

const { MOCK_VEHICLE: vehicle } = mockData;

function getUrl(location, page, typeOfVehicle, limit) {
  const query = QueryString.stringify({
    location,
    page,
    typeOfVehicle,
    limit
  });
  return `/drivers/nearby?${query}`
}

const limit = 10;
const typeOfVehicle = _.sample(TYPE_OF_VEHICLES);
const location = '26.1564,75.6813';
const page = 1;

describe('/drivers/nearby route tests ', () => {
  let server;
  beforeEach(async () => {
    server = await resetAndMockDB(async (allDbs) => {
      allDbs.models.vehicle.$queryInterface.$useHandler((query) => {
        if (query === 'findById') {
          return vehicle;
        }
      });
    });
  });
  it('should return 200', async () => {
    server = await resetAndMockDB(async (allDbs) => {
      allDbs.models.vehicle.findAll = () => [vehicle]
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });
    expect(res.statusCode).toEqual(200);
  });

  it('should return 404', async () => {
    server = await resetAndMockDB(async (allDbs) => {
      allDbs.models.vehicle.findAll = () => []
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });
    expect(res.statusCode).toEqual(404);
    expect(res.result.message).toEqual('No users found');
  });

  it(`should return ${limit} drivers nearby`, async () => {
    server = await resetAndMockDB(async (allDbs) => {
      allDbs.models.vehicle.findAll = () => {
        const arr = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 10; i++) {
          arr.push(vehicle);
        }
        return arr;
      }
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });

    expect(res.statusCode).toEqual(200);
    const firstVehicle = res.result.results[0];
    expect(firstVehicle.brand).toEqual(vehicle.brand);
    expect(firstVehicle.color).toEqual(vehicle.color);
    expect(firstVehicle.type).toEqual(vehicle.type);
    expect(firstVehicle.vehicle_no).toEqual(vehicle.vehicleNo);
  });

  it('should return badImplementation if find nearby drivers fails', async () => {
    server = await resetAndMockDB(async (allDbs) => {
      // eslint-disable-next-line no-param-reassign
      allDbs.models.vehicle.findAll = () =>
        new Promise((resolve, reject) => {
          reject(new Error());
        });
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });
    expect(res.statusCode).toEqual(500);
  });

  it('should return bad request if passed wrong type of vehicle', async () => {
    const typeOfVehicle = `ELECTRIC`;
    server = await resetAndMockDB(async (allDbs) => {
      // eslint-disable-next-line no-param-reassign
      allDbs.models.vehicle.findAll = () => [vehicle]
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });
    expect(res.statusCode).toEqual(400);
    expect(res.result.message).toEqual('Invalid type of vehicle.');
    expect(res.result.validation.source).toEqual('query');
  });

  it('should return bad request if provided wrong geo coordinates in location', async () => {
    const location = '26.1564,275.6813';
    server = await resetAndMockDB(async (allDbs) => {
      // eslint-disable-next-line no-param-reassign
      allDbs.models.vehicle.findAll = () => [vehicle]
    });
    const res = await server.inject({
      method: 'GET',
      url: getUrl(location, page, typeOfVehicle, limit),
    });
    expect(res.statusCode).toEqual(400);
    expect(res.result.message).toEqual('Invalid Coordinates.');
    expect(res.result.validation.source).toEqual('query');
  });
});
