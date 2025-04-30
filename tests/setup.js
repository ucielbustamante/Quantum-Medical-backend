require('dotenv').config({ path: '.env.test', override: true });

const { sequelize } = require('../src/models');
const { Umzug, SequelizeStorage } = require('umzug');
const SequelizePkg = require('sequelize');

const migrator = new Umzug({
  migrations: {
    glob: 'src/migrations/*.js',
    resolve: ({ context, path, name }) => {
      const migration = require(path);
      return {
        name,
        up:   async () => migration.up(context.queryInterface, SequelizePkg),
        down: async () => migration.down(context.queryInterface, SequelizePkg),
      };
    },
  },
  context: {
    queryInterface: sequelize.getQueryInterface(),
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: null,
});

beforeAll(async () => {
  await sequelize.getQueryInterface().dropAllTables();
  await migrator.up();
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});

afterAll(async () => {
  await sequelize.close();
});
