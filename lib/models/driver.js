/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
    const DriverModel = sequelize.define('driver', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      dlNo: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'dl_no'
      },
      dlExpiry: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'dl_expiry'
      },
      averageRating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'average_rating'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        field: 'user_id'
      },
      createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), 
      }
    }, 
    {
      tableName: 'driver',
      timestamps: false,
    }
    );
    // @ts-ignore
    DriverModel.associate = function(models) {
      DriverModel.belongsTo(models.users, {
        foreignKey: 'user_id'
      })
    }
    return DriverModel
}
