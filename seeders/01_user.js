const _ = require('lodash');
const moment = require('moment')
const range = require('lodash/range');
const { faker } = require('@faker-js/faker');
const { hashSync } = require('bcryptjs');

module.exports = {
  // eslint-disable-next-line consistent-return
  up: async(queryInterface, Sequelize) => {
    try {
      const customerUsers = [];
      const driverUsers = [];
      const arr = await range(500).map((index) => {
        const userNo = index + 1;
        const typeOfUser = _.sample(['DRIVER','CUSTOMER']);
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName()
        const point = Sequelize.fn('ST_GeomFromText', `POINT(${faker.address.longitude()} ${faker.address.latitude()})`)
        // eslint-disable-next-line no-unused-vars
        const newUser = {
          id: userNo,
          first_name: firstName,
          last_name: lastName,
          email: faker.internet.email(firstName,lastName).toLowerCase(),
          mobile: Math.floor(Math.random() * 9000000000) + 1000000000,
          password: hashSync(`${firstName}1`,8),
          type_of_user: typeOfUser,
          date_of_birth: moment(faker.date.future().toUTCString()).format('YYYY-MM-DD'),
          city: faker.address.city(),
          location: point 
        }
        if(typeOfUser === 'CUSTOMER') {
          customerUsers.push({
            type: _.sample(['REGULAR', 'PREMIUM']),
            user_id: userNo
          });
        } else {
          driverUsers.push({
            id: userNo,
            dl_no: `AXB${faker.random.numeric(3)}${faker.random.alphaNumeric(7,{ casing: 'upper' })}`,
            dl_expiry: moment(faker.date.future().toUTCString()).format('YYYY-MM-DD'),
            average_rating: 0,
            user_id: userNo
          });
        }
        return newUser;
      }
    );
    const vehiclesToAssign = driverUsers.map((driver) => {
      const typeOfVehicle = _.sample(['CAR', 'BIKE', 'AUTO']);
      let capacity;
      switch (typeOfVehicle) {
        case 'CAR':
          capacity = 4
          break;
        case 'BIKE':
          capacity = 1
          break;
        case 'AUTO':
          capacity = 3
          break
        default:
          break;
      }
      return {
        brand: faker.vehicle.manufacturer(),
        color: faker.vehicle.color(),
        vehicle_no: faker.vehicle.vrm(),
        type: typeOfVehicle,
        max_capacity: capacity,
        engine_type: _.sample(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG']),
        insurance_no: faker.vehicle.vin(),
        insurance_exp: moment(faker.date.future(+faker.random.numeric()).toUTCString()).format('YYYY-MM-DD'),
        driver_id: driver.id
      }
    })
    return await queryInterface.bulkInsert('user', arr, {}) 
      && await queryInterface.bulkInsert('customer', customerUsers, {}) 
      && await queryInterface.bulkInsert('driver', driverUsers, {})
      && queryInterface.bulkInsert('vehicle', vehiclesToAssign, {})
    } catch (error) {
      console.log(error);
    }
  },
  down: async(queryInterface) => await queryInterface.bulkDelete('vehicle', null, {})
    && await queryInterface.bulkDelete('customer', null, {})
    && await queryInterface.bulkDelete('driver', null, {})
    && queryInterface.bulkDelete('user', null, {})
};
