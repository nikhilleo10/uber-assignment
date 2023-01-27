import { badImplementation } from '@utils/responseInterceptors';
import moment from 'moment';
import { TRIP_STATUS_TYPES } from '@utils/constants';
import { models } from '../models/index';

export const bookARide = async (pickUpLocation, dropLocation, custId) => {
  try {
    const ridesData = {
      pickupLoc:pickUpLocation,
      dropLoc: dropLocation,
      dateOfRide: moment(moment.now()).format('YYYY-MM-DD'),
      bookingTime: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss"),
      custId,
      created_at: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss")
    }
    return await models.requestedRides.create(ridesData);
  } catch (error) {
    throw badImplementation(error.message);
  }
};

export const getPendingRides = async(limit, page) => {
  try {
    return await models.requestedRides.findAndCountAll({
      where: {
        driver_id: null,
        tripStatus: TRIP_STATUS_TYPES.PENDING
      },
      limit,
      offset: (limit * page) - limit,
    })
  } catch (error) {
    throw badImplementation(error.message);
  }
}

export const assignDriverToRide = async(driverId, rideId) => {
  try {
    const rideDetails = await models.requestedRides.findOne({
      where: {
        id: rideId,
        tripStatus: TRIP_STATUS_TYPES.PENDING
      }
    });
    if(rideDetails) {
      await rideDetails.update({
      driverId,
        tripStatus: TRIP_STATUS_TYPES.ASSIGNED
      })
      return true
    }
    return false
  } catch (error) {
    throw badImplementation(error.message);
  }
}
