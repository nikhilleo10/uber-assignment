import { badImplementation } from '@utils/responseInterceptors';
import moment from 'moment';
import { GET_TYPE_OF_RIDE, TRIP_STATUS_TYPES } from '@utils/constants';
import _ from 'lodash';
import { models } from '../models/index';

export const bookARide = async (pickUpLocation, dropLocation, estDistance, custId) => {
  try {
    const ridesData = {
      pickupLoc:pickUpLocation,
      dropLoc: dropLocation,
      dateOfRide: moment(moment.now()).format('YYYY-MM-DD'),
      bookingTime: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss"),
      estDistance,
      estFare: (estDistance * _.random(10,100)).toFixed(2),
      custId,
      createdAt: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss")
    }
    // We can create a record in completed rides table if user verifies his/her OTP recieved, as we are not using OTP we will add the record for mocking.
    const requestedRide = await models.requestedRides.create(ridesData, {
      raw: true
    });
    await models.completedRides.create({
      pickupTime:ridesData.bookingTime,
      tripId: requestedRide.id,
      createdAt: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss")
    });
    return requestedRide;
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

export const endRide = async(actualFare, tip, rideId) => {
  try {
    const rideDetails = await models.requestedRides.findOne({
      where: {
        id: rideId,
        tripStatus: TRIP_STATUS_TYPES.ASSIGNED
      }
    });
    if(rideDetails) {
      const completedRideDetails = await models.completedRides.findOne({
        where: {
          tripId: rideDetails.id
        }
      })
      const dropoffTime = moment(moment.now()).format("YYYY-MM-DD HH:mm:ss");
      const duration = moment.duration(moment(dropoffTime).diff(moment(completedRideDetails.pickupTime)));
      const updateData = {
        dropoffTime,
        durationTravelled: `${duration.hours()}:${duration.minutes()}:${duration.seconds()}`,
        actualFare,
        tip
      };
      await completedRideDetails.update(updateData, {
        raw: true
      });
      await rideDetails.update({
        tripStatus: TRIP_STATUS_TYPES.COMPLETED
      });
      return completedRideDetails
    }
    return false
  } catch (error) {
    throw badImplementation(error.message);
  }
}

export const cancelRide = async(reasonForCancellation, rideId) => {
  try {
    const rideDetails = await models.requestedRides.findOne({
      where: {
        id: rideId
      }
    });
    if(rideDetails) {
      if(rideDetails.tripStatus !== TRIP_STATUS_TYPES.PENDING) {
        return {
          success: false,
          message: `Ride cannot be cancelled once ${_.capitalize(rideDetails.tripStatus)}`
        }
      };
      await rideDetails.update({
        tripStatus: TRIP_STATUS_TYPES.CANCELLED
      })
      await models.incompleteRides.create({
        cancellationTime: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss"),
        tripId: rideId, 
        reasonForCancellation,
      })
      return {
        success: true,
        message: 'Ride cancelled successfully.'
      }
    }
    return {
      success: false,
      message: 'Ride not found.'
    }
  } catch (error) {
    throw badImplementation(error.message);
  }
}

export const getRides = async(custId, type, limit, page) => {
  try {
    return await models.requestedRides.findAndCountAll({
      where: {
        custId,
        tripStatus: type === GET_TYPE_OF_RIDE.complete ? TRIP_STATUS_TYPES.COMPLETED : TRIP_STATUS_TYPES.CANCELLED
      },
      include: [
        {
          model: type === GET_TYPE_OF_RIDE.complete ? models.completedRides : models.incompleteRides,
        },
      ],
      limit,
      offset: (limit * page) - limit,
    })
  } catch (error) {
    throw badImplementation(error.message);
  }
}