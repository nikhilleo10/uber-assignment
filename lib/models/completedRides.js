/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
*/
export default function(sequelize, DataTypes){ 
  const completedRideModel = sequelize.define('completed_ride', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pickupTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'pickup_time'
    },
    dropoffTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dropoff_time'
    },
    durationTravelled: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'duration_travelled'
    },
    actualFare: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'actual_fare'
    },
    tip: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'requested_rides',
        key: 'id'
      },
      field: 'trip_id'
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), 
    }
  }, {
    tableName: 'completed_rides',
    timestamps: false
  });
  // @ts-ignore
  completedRideModel.associate = function(models) {
    completedRideModel.belongsTo(models.requestedRides, {
      foreignKey: 'trip_id'
    })
  }
  return completedRideModel;
}