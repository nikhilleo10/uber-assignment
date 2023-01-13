/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable consistent-return */
/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
*/
export default function(sequelize, DataTypes) {
      const userModel = sequelize.define('user', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING(60),
        allowNull: true,
        field: 'last_name'
      },
      email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
      },
      mobile: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      typeOfUser: {
        type: DataTypes.ENUM('DRIVER','CUSTOMER'),
        allowNull: false,
        field: 'type_of_user'
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'date_of_birth'
      },
      city: {
        type: DataTypes.STRING(60),
        allowNull: true
      },
      location: {
        type: DataTypes.GEOGRAPHY('POINT', 4326),
      },
      createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), 
      },
    }, 
    {
      tableName: 'user',
      timestamps: false,
    });
    return userModel;
};