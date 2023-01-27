// @ts-nocheck
import Sequelize from 'sequelize';
// eslint-disable-next-line import/no-extraneous-dependencies
import SequelizeMock from 'sequelize-mock';
import dbConfig from '@config/db';
import user from './user';
import customer from './customer';
import driver from './driver';
import requestedRides from './requestedRides';
import vehicle from './vehicle';
import completedRides from './completedRides';
import incompleteRides from './incompleteRides';

let sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = new SequelizeMock();
} else {
  // eslint-disable-next-line global-require
  const { getLogger } = require('@utils');
  sequelize = new Sequelize.Sequelize(dbConfig.url, {
    logging: getLogger(),
    ...dbConfig,
  });
}

// eslint-disable-next-line import/prefer-default-export
export const models = {
  users: user(sequelize, Sequelize.DataTypes),
  customers: customer(sequelize, Sequelize.DataTypes),
  drivers: driver(sequelize, Sequelize.DataTypes),
  vehicles: vehicle(sequelize, Sequelize.DataTypes),
  requestedRides: requestedRides(sequelize, Sequelize.DataTypes),
  completedRides: completedRides(sequelize, Sequelize.DataTypes),
  incompleteRides: incompleteRides(sequelize, Sequelize.DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
