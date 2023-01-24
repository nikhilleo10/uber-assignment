/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
*/
export default function (sequelize, DataTypes) {
  const requestedRideModel = sequelize.define('requested_rides', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pickupLoc: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'pickup_loc'
    },
    dropLoc: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'drop_loc'
    },
    dateOfRide: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_of_ride'
    },
    bookingTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'booking_time'
    },
    estFare: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'est_fare'
    },
    estDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'est_distance'
    },
    custId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'id'
      },
      field: 'cust_id'
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'driver',
        key: 'id'
      },
      field: 'driver_id'
    }
  }, {
    tableName: 'requested_rides',
    timestamps: false,
  });
  // @ts-ignore
  requestedRideModel.associate = function(models) {
    requestedRideModel.belongsTo(models.customer, {
      foreignKey: 'cust_id'
    });
    requestedRideModel.belongsTo(models.driver, {
      foreignKey: 'driver_id'
    })
  }
  return requestedRideModel;
}
