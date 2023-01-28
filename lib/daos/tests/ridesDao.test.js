import { resetAndMockDB } from '@utils/testUtils';
import { TRIP_STATUS_TYPES } from '@utils/constants';

const updateData = {
  actualFare: 100,
  dropoffTime: "1970-01-01 05:30:00",
  durationTravelled: "0:0:0",
  tip: 10,
}

describe('ridesDao', () => {
  describe('get completed / incomplete rides', () => {
    let findAllSpy;
    it('should return list of completed rides of a user', async () => {
      const limit = 10;
      const page = 1;
      const custId = 1;
      const type = 'completed';

      await resetAndMockDB((db) => {
        const arr = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < limit; i++) {
            arr.push(db.models.requestedRides.build())
        }
        db.models.vehicles.$queueResult(arr);
        findAllSpy = jest.spyOn(db.models.requestedRides, 'findAndCountAll');
      });

      const { getRides } = require('@daos/ridesDao');
      const { models } = require('@models');
      const completedRides = await getRides(custId, type, limit, page);
      expect(findAllSpy).toBeCalledTimes(1);
      expect(findAllSpy).toBeCalledWith({
        where: {
          custId,
          tripStatus: TRIP_STATUS_TYPES.COMPLETED
        },
        include: [
          {
            model: models.completedRides,
          },
        ],
        limit,
        offset: (limit * page) - limit,
      });
      expect(completedRides.rows).toBeArray();
      expect(completedRides.rows).toBeArrayOfSize(limit);
    });

    it('should return list of incomplete rides of a user', async () => {
        let findAllSpy;
        const limit = 10;
        const page = 1;
        const custId = 1;
        const type = 'incomplete';
  
        await resetAndMockDB((db) => {
          const arr = [];
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < limit; i++) {
              arr.push(db.models.requestedRides.build())
          }
          db.models.vehicles.$queueResult(arr);
          findAllSpy = jest.spyOn(db.models.requestedRides, 'findAndCountAll');
        });
  
        const { getRides } = require('@daos/ridesDao');
        const { models } = require('@models');
        const completedRides = await getRides(custId, type, limit, page);
        expect(findAllSpy).toBeCalledTimes(1);
        expect(findAllSpy).toBeCalledWith({
          where: {
            custId,
            tripStatus: TRIP_STATUS_TYPES.CANCELLED
          },
          include: [
            {
              model: models.incompleteRides,
            },
          ],
          limit,
          offset: (limit * page) - limit,
        });
        expect(completedRides.rows).toBeArray();
        expect(completedRides.rows).toBeArrayOfSize(limit);
      });

    it('should return empty array', async () => {
      let findAllSpy;
      await resetAndMockDB((db) => {
        db.models.requestedRides.findAndCountAll = () => new Promise((resolve) => resolve([]));
        findAllSpy = jest.spyOn(db.models.requestedRides, 'findAndCountAll');
      });
      const limit = 10;
      const page = 1;
      const custId = 1;
      const type = 'incomplete';

      const { getRides } = require('@daos/ridesDao');
      const completedRides = await getRides(custId, type, limit, page);
      expect(findAllSpy).toBeCalledTimes(1);
      expect(completedRides).toBeArray();
      expect(completedRides).toBeArrayOfSize(0);
    });
  });

  describe('endRide', () => {
    it('should return updated instance of completed model', async () => {
      const rideId = 1;
      const actualFare = 100;
      const tip = 10;

      await resetAndMockDB((db) => {
        findOneRide = jest.spyOn(db.models.requestedRides, 'findOne');
        if(findOneRide) {
          findOneCompletedRide = jest.spyOn(db.models.completedRides, 'findOne');
          updateCompletedRide = jest.spyOn(db.models.completedRides, 'update');
          updateRequestedRide = jest.spyOn(db.models.requestedRides, 'update')
        }
      });

      const { endRide } = require('@daos/ridesDao');
      const completedRides = await endRide(actualFare, tip, rideId);
      
      expect(findOneRide).toBeCalledTimes(1);
      expect(findOneRide).toBeCalledWith({
        where: {
          id: rideId,
          tripStatus: TRIP_STATUS_TYPES.ASSIGNED
        }
      });
      expect(findOneCompletedRide).toBeCalledTimes(1)
      expect(findOneCompletedRide).toBeCalledWith({
        where: {
          tripId: findOneRide.id
        }
      })
      expect(updateCompletedRide).toBeCalledTimes(1);
      expect(updateCompletedRide).toBeCalledWith(updateData,
      {
        raw: true
      });
      expect(updateRequestedRide).toBeCalledTimes(1);
      expect(updateRequestedRide).toBeCalledWith({
        tripStatus: TRIP_STATUS_TYPES.COMPLETED
      })
      expect(completedRides._defaults.tripStatus).toEqual(TRIP_STATUS_TYPES.COMPLETED)
      expect(completedRides._defaults.completedRides.actualFare).toEqual(actualFare)
    });

    it('should return false if ride not found', async () => {
      const rideId = 1;
      const actualFare = 100;
      const tip = 10;

      await resetAndMockDB((db) => {
        db.models.requestedRides.findOne = () => null;
        findOneRide = jest.spyOn(db.models.requestedRides, 'findOne');
      });
  
      const { endRide } = require('@daos/ridesDao');
      const completedRides = await endRide(actualFare, tip, rideId);
      expect(findOneRide).toBeCalledTimes(1);
      expect(completedRides).toEqual(false)
    });
  });

  describe('cancelRide', () => {
    it('should return updated instance of completed model', async () => {
      const rideId = 1;
      const reasonForCancellation = 'I don"t want the ride anymore. I got a better ride.'

      await resetAndMockDB((db) => {
        findOneRide = jest.spyOn(db.models.requestedRides, 'findOne').mockReturnValue(db.models.requestedRides.build());

        findOneRide.update = () => db.models.requestedRides.create();

        if(findOneRide) {
          findOneCompletedRide = jest.spyOn(db.models.completedRides, 'findOne');
          updateRequestedRide = jest.spyOn(db.models.requestedRides, 'update')
        }
      });
      
      const { cancelRide } = require('@daos/ridesDao');
      const incompleteRides = await cancelRide(reasonForCancellation, rideId);
      
      expect(findOneRide).toBeCalledTimes(1);
      expect(findOneRide).toBeCalledWith({
        where: {
          id: rideId
        }
      });

      expect(incompleteRides.success).toEqual(true)
      expect(incompleteRides.message).toEqual('Ride cancelled successfully.')
    });

    it('should return false if ride not found', async () => {
      const rideId = 1;
      const reasonForCancellation = 'I don"t want the ride anymore. I got a better ride.'

      await resetAndMockDB((db) => {
        db.models.requestedRides.findOne = () => null
        findOneRide = jest.spyOn(db.models.requestedRides, 'findOne');
        if(findOneRide) {
          return {
            success: false,
          }
        }
      });
  
      const { cancelRide } = require('@daos/ridesDao');
      const incompleteRides = await cancelRide(reasonForCancellation, rideId);

      expect(findOneRide).toBeCalledTimes(1);
      expect(incompleteRides.success).toEqual(false)
      expect(incompleteRides.message).toEqual('Ride not found.')
    });
  });
});
