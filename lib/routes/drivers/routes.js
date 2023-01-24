import get from 'lodash/get';
import { notFound, badImplementation } from '@utils/responseInterceptors';
import Joi from 'joi';
import { getNearbyDrivers } from '@daos/driverDao';
import { locationSchema, typeOfVehicleSchema } from '../../../utils/validationUtils';

export default [
  {
    method: 'GET',
    path: '/nearby',
    options: {
      description: 'get nearby users',
      notes: 'GET nearby users API',
      tags: ['api', 'users'],
      plugins: {
        pagination: {
          enabled: true,
        },
        query: {
          pagination: true,
        },
      },
      validate: {
        query: Joi.object({
          location: locationSchema,
          page: Joi.number().optional(),
          typeOfVehicle: typeOfVehicleSchema
        }),
        options:{
          allowUnknown: true,
          abortEarly: true
        },
        failAction: async (request, h, err) => {
          throw err;
        }
      },
    },
    handler: async (request, h) => {
      const { query } = request;
      const { limit, page, location, typeOfVehicle } = query;
      return getNearbyDrivers(location.split(','), limit, page, typeOfVehicle)
        .then((users) => {
          if (get(users, 'length')) {;
            return h.response({
              results: users,
            });
          }
          return notFound('No users found');
        })
        .catch((error) => badImplementation(error.message));
    },
  },
];
