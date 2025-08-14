const { sequelize } = require('../models');

// Setup test database
beforeAll(async () => {
  // Use test database configuration
  process.env.NODE_ENV = 'test';
  
  try {
    await sequelize.authenticate();
    console.log('Test database connection established.');
    
    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('Test database synchronized.');
  } catch (error) {
    console.error('Unable to connect to test database:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  const models = Object.values(sequelize.models);
  
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
});