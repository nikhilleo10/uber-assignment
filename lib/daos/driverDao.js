import { models } from '@models';
import { badImplementation } from '@utils/responseInterceptors';
import sequelize from 'sequelize';

export const findOneUser = async () => models.users.findOne();

export const getNearbyDrivers = async (points, limit, page, typeOfVehicle) => {
  try {
    const locationSql = sequelize.literal(
      `ST_GeomFromText('POINT(${points[0]} ${points[1]})')`
    );
    const data = await models.vehicle.findAll({
      attributes: ['type', 'brand', 'color', 'max_capacity', 'vehicle_no'],
      include: [
        {
          model: models.driver,
          as: 'driver',
          attributes: ['average_rating', 'dl_no', 'dl_expiry'],
          include: [
            {
              model: models.users,
              as: 'user',
              attributes: [
                'first_name',
                'last_name',
                'email',
                'mobile',
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
        type: typeOfVehicle
      },
      order: [[sequelize.literal('`driver.user.distance_in_km`'), 'ASC']],
      limit,
      offset: page * limit,
      raw: true,
      nest: true,
    });
    if(data.length > 0) {
      data.map((item) => {
        // eslint-disable-next-line no-param-reassign
        item.driver.user.distance_in_km = (
          Number(item.driver.user.distance_in_km) / 1000
        ).toPrecision(2);
        return item;
      });
      return data;
    }
    return []
  } catch (error) {
    throw badImplementation(error.message);
  }
};
