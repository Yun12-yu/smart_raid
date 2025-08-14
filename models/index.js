const { sequelize } = require('../config/database');
const Driver = require('./Driver');
const Booking = require('./Booking');
const Mission = require('./Mission');
const User = require('./User');

// Define associations
Driver.hasMany(Booking, { foreignKey: 'driver_id', as: 'bookings' });
Booking.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

Booking.hasOne(Mission, { foreignKey: 'booking_id', as: 'mission' });
Mission.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driverProfile' });
Driver.hasOne(User, { foreignKey: 'driver_id', as: 'user' });

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Driver,
  Booking,
  Mission,
  User,
  syncDatabase
};