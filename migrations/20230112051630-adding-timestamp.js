const { migrate } = require("../utils/migration");

module.exports = {
  up: (queryInterface) => migrate(__filename, queryInterface),
  down: () => Promise.reject(new Error('error')),
};
