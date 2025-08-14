const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'smart_taxis_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'smart_taxis_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';

// Create Sequelize instance
let sequelize;
if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (for both development and production)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: config[env].dialectOptions,
    logging: config[env].logging
  });
} else {
  // Use individual config parameters
  sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    {
      host: config[env].host,
      port: config[env].port,
      dialect: config[env].dialect,
      dialectOptions: config[env].dialectOptions,
      logging: config[env].logging
    }
  );
}

module.exports = { sequelize, config };