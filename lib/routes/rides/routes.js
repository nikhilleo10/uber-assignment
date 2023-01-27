import get from 'lodash/get';
import { notFound, badImplementation, badRequest } from '@utils/responseInterceptors';
import Joi from 'joi';
import { bookARide, getPendingRides, assignDriverToRide } from '@daos/ridesDao';
import { customerIdSchema, idSchema, trimmedStringSchema } from '@utils/validationUtils';

export default [
  {
    method: 'POST',
    path: '/',
    options: {
      description: 'Book a ride for a user',
      notes: 'Book a ride for a user API',
      tags: ['api', 'rides'],
      validate: {
        payload: Joi.object({
          customerId: customerIdSchema,
          pickUpLocation: trimmedStringSchema.error(new Error('Pickup location is required.')),
          dropLocation: trimmedStringSchema.error(new Error('Drop location is required.'))
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
      const { payload } = request;
      const { pickUpLocation, dropLocation, customerId } = payload;
      return bookARide(pickUpLocation, dropLocation, customerId)
        .then((ride) => h.response({
          results: {
            message: 'Ride is requested, please wait until we assign a driver to you.',
            ride
          },
        }).code(201))
        .catch((error) => badImplementation(error.message));
    },
  },
  {
    method: 'GET',
    path: '/',
    options: {
      description: 'Get pending rides',
      notes: 'Get pending rides API',
      tags: ['api', 'rides'],
      plugins: {
        pagination: {
          enabled: true,
        },
        query: {
          pagination: true,
        },
      }
    },
    handler: async (request, h) => {
      try {
        const { query } = request;
        const { limit, page } = query;
        const { count, rows } = await getPendingRides(limit, page)
          if(get(rows, 'length')) {
            return h.response({
              results: [
                ...rows
              ],
              totalCount: count
            })
          }
          return notFound('No Pending Rides found');
      } catch (error) {
        throw badImplementation(error.message)
      }
    },
  },
  {
    method: 'POST',
    path: '/{rideId}/accept',
    options: {
      description: 'Accept a ride',
      notes: 'Accept a ride API',
      tags: ['api', 'rides'],
      validate: {
        params: Joi.object({
          rideId: idSchema.error(new Error('Invalid Ride Id.'))
        }),
        payload: Joi.object({
          driverId: idSchema.error(new Error('Invalid Driver Id.')),
        }),
        options:{
          allowUnknown: true,
          abortEarly: true
        },
        failAction: async (request, h, err) => {
          throw err;
        }
      }
    },
    handler: async (request, h) => {
     try {
        const { params, payload } = request;
        const { rideId } = params;
        const { driverId } = payload;
        const updatedRecord = await assignDriverToRide(driverId, rideId)
        if(updatedRecord) {
          return h.response({
            message: 'Ride assigned successfully.',
          });
        }
        return badRequest('Cannot assign ride.');
      } catch (error) {
        throw badImplementation(error.message)
     }
    },
  },
];
