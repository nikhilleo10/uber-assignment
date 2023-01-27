import { resetAndMockDB } from '@utils/testUtils';
import { ROUTE_NAMES } from '@utils/constants';

function getUrl(routeName, params) {
  switch (routeName) {
    case ROUTE_NAMES.ACCEPT_RIDE:
      return `/rides/${params.rideId}/accept`
    
    default:
      return `/rides`
  }
}

let bookRidePayload = {
  customerId: 1,
  pickUpLocation: 'Balaji nagar, Pune',
  dropLocation:  'Fatima nagar, Pune'
};

describe('rides routes', () => {
  describe('/rides request a ride route tests ', () => {
    let server;
    beforeEach(async () => {
        server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.create(bookRidePayload));
    });
  
    afterEach(async () => {
      bookRidePayload = {
        customerId: 1,
        pickUpLocation: 'Balaji nagar, Pune',
        dropLocation:  'Fatima nagar, Pune'
      };
    });
  
    it('should return 201', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.BOOK_RIDE),
        payload: bookRidePayload
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(201);
      expect(res.result.results.message).toEqual('Ride is requested, please wait until we assign a driver to you.')
    });
  
    it('should return 400', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.BOOK_RIDE),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
    });
  
    it('should return 400 with error message for particular payload', async () => {
      delete bookRidePayload.pickUpLocation;
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.BOOK_RIDE),
        payload: bookRidePayload
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Pickup location is required.')
    });
  
    it('should return 400 with error message for invalid payload', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.BOOK_RIDE),
        payload: {
          ...bookRidePayload,
          customerId: 'AAVB'
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Invalid customer id.')
    });
  
    it('should return badImplementation if book ride api fails', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        // eslint-disable-next-line no-param-reassign
        allDbs.models.requestedRides.create = () =>
          new Promise((resolve, reject) => {
            reject(new Error());
          });
      });
      const res = await server.inject({
        method: 'POST',
        url: getUrl(ROUTE_NAMES.BOOK_RIDE, { customerId: 1 }),
        payload: bookRidePayload
      });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('/rides/ get pending rides route tests ', () => {
    let server;
    beforeEach(async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll());
    });
  
    it('should return 200', async () => {
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_PENDING_RIDES),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(200);
      expect(res.result.results).toBeArray();
      expect(res.result.results).toBeArrayOfSize(10);
      expect(res.result.total_count).toEqual(10);
    });
  
    it('should return 404', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll = () => []);
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_PENDING_RIDES),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(404);
      expect(res.result.message).toEqual('No Pending Rides found');
    });
  
    it('should return badImplementation if pending rides api fails', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        // eslint-disable-next-line no-param-reassign
        allDbs.models.requestedRides.findAndCountAll = () =>
          new Promise((resolve, reject) => {
            reject(new Error());
          });
      });
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_PENDING_RIDES),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(500);
    });
  });

  
  describe('/rides/accept/{rideId} accept a ride route tests ', () => {
    let server;
    beforeEach(async () => {
        server = await resetAndMockDB(async (allDbs) => {
          const foundDriver = allDbs.models.requestedRides.findOne();
          foundDriver.update()
        });
    });
  
    it('should return 200', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.ACCEPT_RIDE, { rideId: 1 }),
        payload: {
          driverId: 1
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(200);
      expect(res.result.message).toEqual('Ride assigned successfully.')
    });
  
    it('should return 400', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findOne = () => null)
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.ACCEPT_RIDE, { rideId: 1 }),
        payload: {
          driverId: 1
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Cannot assign ride.');
    });

    it('should return 400 with error message for invalid params', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.ACCEPT_RIDE, { rideId: 1 }),
        payload: {
          driverId: 'a'
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Invalid Driver Id.')
    });
  
    it('should return badImplementation if accept a ride api fails', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        // eslint-disable-next-line no-param-reassign
        allDbs.models.requestedRides.update = () =>
          new Promise((resolve, reject) => {
            reject(new Error());
          });
      });
      const res = await server.inject({
        method: 'POST',
        url: getUrl(ROUTE_NAMES.ACCEPT_RIDE, { rideId: 1 }),
        payload: {
          driverId: 1
        }
      });
      console.log(res);
      expect(res.statusCode).toEqual(500);
    });
  });

});
