/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
*/
export default function(sequelize, DataTypes) {
    const incompleteRideModel = sequelize.define('incomplete_rides', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cancellationTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'cancellation_time'
    },
    reasonForCancellation: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'reason_for_cancellation'
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
    tableName: 'incomplete_rides',
    timestamps: false
  });
  // @ts-ignore
  incompleteRideModel.associate = function(models) {
    incompleteRideModel.belongsTo(models.requestedRides, {
      foreignKey: 'trip_id'
    })
  }
  return incompleteRideModel;
}
