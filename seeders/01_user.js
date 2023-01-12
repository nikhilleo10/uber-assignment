/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
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
          location: point,
          created_at: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss") 
        }
        if(typeOfUser === 'CUSTOMER') {
          customerUsers.push({
            type: _.sample(['REGULAR', 'PREMIUM']),
            user_id: userNo,
            created_at: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss")
          });
        } else {
          driverUsers.push({
            id: userNo,
            dl_no: `AXB${faker.random.numeric(3)}${faker.random.alphaNumeric(7,{ casing: 'upper' })}`,
            dl_expiry: moment(faker.date.future().toUTCString()).format('YYYY-MM-DD'),
            average_rating: 0,
            user_id: userNo,
            created_at: moment(moment.now()).format("YYYY-MM-DD HH:mm:ss")
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
      arr.length ? await queryInterface.bulkInsert('user', arr, {}) : null;
      customerUsers.length ? await queryInterface.bulkInsert('customer', customerUsers, {}) : null;
      driverUsers.length ? await queryInterface.bulkInsert('driver', driverUsers, {}) : null;
      vehiclesToAssign.length ? queryInterface.bulkInsert('vehicle', vehiclesToAssign, {}) : null;
      return true;
    } catch (error) {
      console.log(error);
    }
  },
  down: async(queryInterface) => {
    await queryInterface.bulkDelete('vehicle', null, {})
    await queryInterface.bulkDelete('customer', null, {})
    await queryInterface.bulkDelete('driver', null, {})
    await queryInterface.bulkDelete('user', null, {})
    return true;
  }
};
