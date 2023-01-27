import { resetAndMockDB } from '@utils/testUtils';
import { sample } from 'lodash';
import sequelize from 'sequelize';

describe('driverDao', () => {
  describe('getNearbyDrivers', () => {
    let findAllSpy;
    it('should return list of nearby drivers to a given point', async () => {
      const limit = 10;
      const page = 1;
      const typeOfVehicle = sample(['CAR','BIKE','AUTO']);
      const vehicleAttributes = ['type', 'brand', 'color', 'max_capacity', 'vehicle_no'];
      const driverAttributes = ['average_rating', 'dl_no', 'dl_expiry'];
      const userAttributes = ['first_name', 'last_name', 'email', 'mobile'];
      await resetAndMockDB((db) => {
        const arr = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < limit; i++) {
            arr.push(db.models.vehicles.build())
        }
        db.models.vehicles.$queueResult(arr);
        findAllSpy = jest.spyOn(db.models.vehicles, 'findAll');
      });
      const points = [26.1564, 75.6813];
      const locationSql = sequelize.literal(
        `ST_GeomFromText('POINT(${points[0]} ${points[1]})')`
      );
      const { getNearbyDrivers } = require('@daos/driverDao');
      const { models } = require('@models');
      const nearbyUsers = await getNearbyDrivers(points, limit, page, typeOfVehicle);
      expect(findAllSpy).toBeCalledTimes(1);
      expect(findAllSpy).toBeCalledWith({
        attributes: vehicleAttributes,
        include: [
          {
            model: models.drivers,
            as: 'driver',
            attributes: driverAttributes,
            include: [
              {
                model: models.users,
                as: 'user',
                attributes: [
                  ...userAttributes,
                  [
                    sequelize.fn(
                      'ST_Distance_Sphere',
                      sequelize.literal('location'),
                      locationSql
                    ),
                    'distance_in_km',
                  ],
                ],
              },
            ],
          },
        ],
        where: {
          type: typeOfVehicle,
        },
        order: [[sequelize.literal('`driver.user.distance_in_km`'), 'ASC']],
        limit,
        offset: (page * limit) - limit,
        raw: true,
        nest: true,
      });
      expect(nearbyUsers).toBeArray();
      expect(nearbyUsers).toBeArrayOfSize(limit);
    });

    it('should return empty array', async () => {
      let findAllSpy;
      await resetAndMockDB((db) => {
        db.models.vehicles.findAll = () => new Promise((resolve) => resolve([]));
        findAllSpy = jest.spyOn(db.models.vehicles, 'findAll');
      });
      const points = [26.1564, 89.6813];
      const limit = 10;
      const page = 1;
      const typeOfVehicle = 'CAR';
      const { getNearbyDrivers } = require('@daos/driverDao');
      const driversNearBy = await getNearbyDrivers(points, limit, page, typeOfVehicle);
      expect(findAllSpy).toBeCalledTimes(1);
      expect(driversNearBy).toBeArray();
      expect(driversNearBy).toBeArrayOfSize(0);
    });
  });
});
