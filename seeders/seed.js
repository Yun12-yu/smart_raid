const { Driver, Booking, Mission, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Sample data arrays
const driverNames = [
  'John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Sarah Johnson', 'David Lee',
  'Anna Kowalski', 'Carlos Rodriguez', 'Lisa Chen', 'Michael Brown', 'Elena Petrov'
];

const customerNames = [
  'Alice Cooper', 'Bob Wilson', 'Charlie Davis', 'Diana Prince', 'Edward Norton',
  'Fiona Green', 'George Miller', 'Helen White', 'Ivan Petrov', 'Julia Roberts',
  'Kevin Hart', 'Laura Palmer', 'Mark Thompson', 'Nancy Drew', 'Oscar Wilde'
];

const locations = [
  'Downtown Plaza', 'Airport Terminal', 'Central Station', 'Shopping Mall',
  'University Campus', 'Business District', 'Residential Area', 'Hospital',
  'Sports Stadium', 'Convention Center', 'Beach Resort', 'Mountain View',
  'City Park', 'Tech Hub', 'Financial Center'
];

const statuses = ['completed', 'completed', 'completed', 'cancelled', 'completed'];
const missionStatuses = ['completed', 'completed', 'completed', 'cancelled', 'completed'];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random date in the past 6 months
const getRandomPastDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Helper function to calculate fare based on distance (mock)
const calculateFare = () => {
  const baseFare = 5.00;
  const perKmRate = 2.50;
  const distance = Math.random() * 20 + 1; // 1-21 km
  return Math.round((baseFare + (distance * perKmRate)) * 100) / 100;
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Mission.destroy({ where: {} });
    await Booking.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Driver.destroy({ where: {} });

    console.log('Cleared existing data.');

    // Create drivers
    const drivers = [];
    for (let i = 0; i < 10; i++) {
      const driver = await Driver.create({
        name: driverNames[i],
        phone: `555${String(i).padStart(3, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status: getRandomItem(['available', 'busy', 'offline']),
        current_location: getRandomItem(locations),
        created_at: getRandomPastDate()
      });
      drivers.push(driver);
    }

    console.log(`Created ${drivers.length} drivers.`);

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@smarttaxis.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create driver users
    for (let i = 0; i < 5; i++) {
      await User.create({
        username: `driver${i + 1}`,
        email: `driver${i + 1}@smarttaxis.com`,
        password: 'driver123',
        role: 'driver',
        driver_id: drivers[i].id
      });
    }

    console.log('Created users with authentication.');

    // Create bookings and missions
    const bookings = [];
    for (let i = 0; i < 150; i++) {
      const createdAt = getRandomPastDate();
      const status = getRandomItem(statuses);
      const assignedDriver = Math.random() > 0.1 ? getRandomItem(drivers) : null; // 90% assigned

      const booking = await Booking.create({
        customer_name: getRandomItem(customerNames),
        pickup_location: getRandomItem(locations),
        dropoff_location: getRandomItem(locations),
        fare: calculateFare(),
        status: status,
        driver_id: assignedDriver ? assignedDriver.id : null,
        created_at: createdAt
      });

      bookings.push(booking);

      // Create mission if booking is assigned
      if (assignedDriver && status !== 'pending') {
        const startTime = new Date(createdAt.getTime() + (Math.random() * 30 * 60 * 1000)); // 0-30 min after booking
        const endTime = status === 'completed' ? 
          new Date(startTime.getTime() + (Math.random() * 60 * 60 * 1000)) : // 0-60 min duration
          null;

        await Mission.create({
          booking_id: booking.id,
          status: getRandomItem(missionStatuses),
          start_time: startTime,
          end_time: endTime,
          created_at: createdAt
        });
      }
    }

    console.log(`Created ${bookings.length} bookings with associated missions.`);
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}