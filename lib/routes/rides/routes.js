import get from 'lodash/get';
import { notFound, badImplementation, badRequest } from '@utils/responseInterceptors';
import Joi from 'joi';
import { bookARide, getPendingRides, assignDriverToRide, endRide, cancelRide, getRides } from '@daos/ridesDao';
import { customerIdSchema, idSchema, decimalSchema, trimmedStringSchema, typeOfRideSchema } from '@utils/validationUtils';
import { GET_TYPE_OF_RIDE, TRIP_STATUS_TYPES } from '@utils/constants';
import _ from 'lodash';

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
          dropLocation: trimmedStringSchema.error(new Error('Drop location is required.')),
          estDistance: decimalSchema.error(new Error('Estimated distance is required.')),
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
      const { pickUpLocation, dropLocation, estDistance, customerId } = payload;
      return bookARide(pickUpLocation, dropLocation, estDistance, customerId)
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
  {
    method: 'POST',
    path: '/{rideId}/end',
    options: {
      description: 'End a ride',
      notes: 'End a ride API',
      tags: ['api', 'rides'],
      validate: {
        params: Joi.object({
          rideId: idSchema.error(new Error('Invalid Ride Id.'))
        }),
        payload: Joi.object({
          actualFare: decimalSchema.error(new Error('Actual fair is required.')),
          tip: decimalSchema.error(new Error('Tip is required.'))
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
        const { actualFare, tip } = payload;
        const updatedRecord = await endRide(actualFare, tip, rideId)
        if(updatedRecord) {
          return h.response({
            message: `Ride completed successfully. Please charge Rs.${updatedRecord.actualFare} to the customer.`,
          });
        }
        return badRequest('Cannot end the ride.');
      } catch (error) {
        throw badImplementation(error.message)
     }
    },
  },
  {
    method: 'POST',
    path: '/{rideId}/cancel',
    options: {
      description: 'Cancel a ride',
      notes: 'Cancel a ride API',
      tags: ['api', 'rides'],
      validate: {
        params: Joi.object({
          rideId: idSchema.error(new Error('Invalid Ride Id.'))
        }),
        payload: Joi.object({
          reasonForCancellation: trimmedStringSchema.min(30).error(new Error('Reason for cancellation must be atleast 30 characters.')),
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
        const { reasonForCancellation } = payload;
        const { success , message } = await cancelRide(reasonForCancellation, rideId)
        if(success) {
          return h.response({
            message,
          });
        }
        return badRequest(message);
      } catch (error) {
        throw badImplementation(error.message)
     }
    },
  },
  {
    method: 'GET',
    path: '/{type}',
    options: {
      description: 'Get Completed/Incomplete rides',
      notes: 'Get Completed/Incomplete rides API',
      tags: ['api', 'rides'],
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
          custId: customerIdSchema
        }),
        params: Joi.object({
          type: typeOfRideSchema
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
        const { query, params } = request;
        const { limit, page, custId } = query;
        const { type } = params;
        const { count, rows } = await getRides(custId, type, limit, page)
          if(get(rows, 'length')) {
            return h.response({
              results: [
                ...rows
              ],
              totalCount: count
            })
          }
          return notFound(`You do not have ${_.lowerCase(type === GET_TYPE_OF_RIDE.complete ? TRIP_STATUS_TYPES.COMPLETED : TRIP_STATUS_TYPES.CANCELLED)} ride.`);
      } catch (error) {
        throw badImplementation(error.message)
      }
    },
  }
];
