/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
*/
export default function(sequelize, DataTypes) {
  const vehicleModel = sequelize.define('vehicle', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    brand: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    vehicleNo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'vehicle_no'
    },
    type: {
      type: DataTypes.ENUM('CAR','BIKE','AUTO'),
      allowNull: false
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'max_capacity'
    },
    engineType: {
      type: DataTypes.ENUM('PETROL','DIESEL','ELECTRIC','CNG'),
      allowNull: false,
      field: 'engine_type'
    },
    insuranceNo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'insurance_no'
    },
    insuranceExp: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'insurance_exp'
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'driver',
        key: 'id'
      },
      field: 'driver_id'
    }
  }, {
    tableName: 'vehicle',
    timestamps: false,
  });

  // @ts-ignore
  vehicleModel.associate = function(models) {
    vehicleModel.belongsTo(models.driver, {
      foreignKey: 'driver_id',
    })
  }
  return vehicleModel;
}