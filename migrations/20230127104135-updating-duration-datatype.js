const { migrate, undoMigrate } = require("../utils/migration");

module.exports = {
  up: (queryInterface) => migrate(__filename, queryInterface),
  down: (queryInterface) => undoMigrate(__filename, queryInterface),
};
