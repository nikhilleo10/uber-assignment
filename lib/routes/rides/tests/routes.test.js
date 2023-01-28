import { resetAndMockDB } from '@utils/testUtils';
import { ROUTE_NAMES } from '@utils/constants';
import { mockData } from '../../../../utils/mockData';

function getUrl(routeName, params, query) {
  switch (routeName) {
    case ROUTE_NAMES.ACCEPT_RIDE:
      return `/rides/${params.rideId}/accept`

    case ROUTE_NAMES.END_RIDE:
        return `/rides/${params.rideId}/end`
    
    case ROUTE_NAMES.GET_COMPLETE_INCOMPLETE_RIDE:
        return `/rides/${params.type}?custId=${query.custId}`
    
    case ROUTE_NAMES.CANCEL_RIDE:
        return `/rides/${params.rideId}/cancel`
    
    default:
      return `/rides`
  }
}

let bookRidePayload = {
  customerId: 1,
  pickUpLocation: 'Balaji nagar, Pune',
  dropLocation:  'Fatima nagar, Pune',
  estDistance: 10.10,
  estFare: 100.10
};

const completedRidePayload = {
  pickupTime: '2023-01-24 10:43:18',
  tripId: 1,
};

describe('rides routes', () => {
  describe('/rides request a ride route tests ', () => {
    let server;
    beforeEach(async () => {
        server = await resetAndMockDB(async (allDbs) => {
          const requstedRide = allDbs.models.requestedRides.create(bookRidePayload)
          await allDbs.models.completedRides.create(completedRidePayload);
          return requstedRide;
        });
    });
  
    afterEach(async () => {
      bookRidePayload = {
        customerId: 1,
        pickUpLocation: 'Balaji nagar, Pune',
        dropLocation:  'Fatima nagar, Pune',
        estDistance: 10.10,
        estFare: 100.10
      }
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
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll = () => {
        const arr = []
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 10; i++) {
          arr.push(mockData.MOCK_REQUESTED_RIDES)
        }
        return {
          count: 10,
          rows: arr
        }
      });
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
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('/rides/{type} get completed / incomplete rides route tests ', () => {
    let server;
    beforeEach(async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll());
    });
  
    it('should return 200', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        allDbs.models.requestedRides.findAndCountAll = () => {
          const arr = []
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < 10; i++) {
            arr.push(mockData.MOCK_COMPLETED_RIDES)
          }
          return {
            count: 10,
            rows: arr 
          }
        }
      });
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_COMPLETE_INCOMPLETE_RIDE, { type: 'completed' }, { custId: 1 }),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(200);
      expect(res.result.results).toBeArray();
      expect(res.result.results).toBeArrayOfSize(10);
      expect(res.result.total_count).toEqual(10);
    });
  
    it('should return 400', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll = () => []);
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_COMPLETE_INCOMPLETE_RIDE, { type: 'complete' }, { custId: 1 }),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Invalid type of ride.');
    });
    it('should return 404', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findAndCountAll = () => []);
      const injectOptions = {
        method: 'GET',
        url: getUrl(ROUTE_NAMES.GET_COMPLETE_INCOMPLETE_RIDE, { type: 'completed' }, { custId: 1 }),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(404);
      expect(res.result.message).toEqual('You do not have completed ride.');
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
        url: getUrl(ROUTE_NAMES.GET_COMPLETE_INCOMPLETE_RIDE, { type: 'completed' }, { custId: 1 }),
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('/rides/{rideId}/end end a ride route tests ', () => {
    let server;
    beforeEach(async () => {
        // eslint-disable-next-line no-unused-vars
        server = await resetAndMockDB(async (allDbs) => mockData.MOCK_REQUESTED_RIDES);
    });
  
    it('should return 200', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.END_RIDE, { rideId: 1 }),
        payload: {
          actualFare: 860.21,
          tip: 10
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(200);
      expect(res.result.message).toContain('Ride completed successfully')
    });
  
    it('should return 400', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findOne = () => null)
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.END_RIDE, { rideId: 1 }),
        payload: {
          actualFare: 860.21,
          tip: 10
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Cannot end the ride.');
    });

    it('should return 400 with error message for invalid params', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.END_RIDE, { rideId: 1 }),
        payload: {
          tip: 10
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Actual fair is required.')
    });
  
    it('should return badImplementation if accept a ride api fails', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        // eslint-disable-next-line no-param-reassign
        allDbs.models.requestedRides.findOne = () =>
          new Promise((resolve, reject) => {
            reject(new Error());
          });
      });
      const res = await server.inject({
        method: 'POST',
        url: getUrl(ROUTE_NAMES.END_RIDE, { rideId: 1 }),
        payload: {
          actualFare: 860.21,
          tip: 10
        }
      });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('/rides/{rideId}/cancel cancel a ride route tests ', () => {
    let server;
    beforeEach(async () => {
        // eslint-disable-next-line no-unused-vars
        server = await resetAndMockDB(async (allDbs) => ({
          success: true,
          message: 'Ride cancelled successfully.'
        }));
    });
  
    it('should return 200', async () => {
      server = await resetAndMockDB(async (db) => {
        findOneRide = jest.spyOn(db.models.requestedRides, 'findOne').mockReturnValue(db.models.requestedRides.build());

        findOneRide.update = () => db.models.requestedRides.create();

        if(findOneRide) {
          findOneCompletedRide = jest.spyOn(db.models.completedRides, 'findOne');
          updateRequestedRide = jest.spyOn(db.models.requestedRides, 'update')
        }
      })
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.CANCEL_RIDE, { rideId: 1 }),
        payload: {
          reasonForCancellation: 'I do not want this ride anymore, I have found a better ride.',
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(200);
      expect(res.result.message).toContain('Ride cancelled successfully')
    });
  
    it('should return 400', async () => {
      server = await resetAndMockDB(async (allDbs) => allDbs.models.requestedRides.findOne = () => null)
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.CANCEL_RIDE, { rideId: 1 }),
        payload: {
          reasonForCancellation: 'I do not want this ride anymore, I have found a better ride.',
        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Ride not found.');
    });

    it('should return 400 with error message for invalid params', async () => {
      const injectOptions = {
        method: 'POST',
        url: getUrl(ROUTE_NAMES.CANCEL_RIDE, { rideId: 1 }),
        payload: {

        }
      }
      const res = await server.inject(injectOptions);
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toEqual('Reason for cancellation must be atleast 30 characters.')
    });
  
    it('should return badImplementation if accept a ride api fails', async () => {
      server = await resetAndMockDB(async (allDbs) => {
        // eslint-disable-next-line no-param-reassign
        allDbs.models.requestedRides.findOne = () =>
          new Promise((resolve, reject) => {
            reject(new Error());
          });
      });
      const res = await server.inject({
        method: 'POST',
        url: getUrl(ROUTE_NAMES.CANCEL_RIDE, { rideId: 1 }),
        payload: {
          reasonForCancellation: 'I do not want this ride anymore, I have found a better ride.',
        }
      });
      expect(res.statusCode).toEqual(500);
    });
  });
});
