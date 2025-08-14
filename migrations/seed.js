const { Driver, Booking, Mission, User } = require('../models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create sample drivers
    const drivers = await Driver.bulkCreate([
      {
        name: 'John Smith',
        phone: '+1234567890',
        license_number: 'DL001',
        vehicle_type: 'sedan',
        vehicle_plate: 'ABC123',
        status: 'available'
      },
      {
        name: 'Sarah Johnson',
        phone: '+1234567891',
        license_number: 'DL002',
        vehicle_type: 'suv',
        vehicle_plate: 'XYZ789',
        status: 'available'
      },
      {
        name: 'Mike Wilson',
        phone: '+1234567892',
        license_number: 'DL003',
        vehicle_type: 'sedan',
        vehicle_plate: 'DEF456',
        status: 'busy'
      },
      {
        name: 'Emily Davis',
        phone: '+1234567893',
        license_number: 'DL004',
        vehicle_type: 'hatchback',
        vehicle_plate: 'GHI789',
        status: 'available'
      },
      {
        name: 'David Brown',
        phone: '+1234567894',
        license_number: 'DL005',
        vehicle_type: 'suv',
        vehicle_plate: 'JKL012',
        status: 'offline'
      }
    ]);

    console.log(`Created ${drivers.length} drivers`);

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@smarttaxis.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        username: 'john_driver',
        email: 'john@smarttaxis.com',
        password: hashedPassword,
        role: 'driver',
        driver_id: drivers[0].id
      },
      {
        username: 'sarah_driver',
        email: 'sarah@smarttaxis.com',
        password: hashedPassword,
        role: 'driver',
        driver_id: drivers[1].id
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample bookings with varied dates for analytics
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    const customerNames = [
      'Alice Cooper', 'Bob Johnson', 'Charlie Brown', 'Diana Prince',
      'Edward Norton', 'Fiona Apple', 'George Lucas', 'Helen Hunt',
      'Ivan Drago', 'Julia Roberts', 'Kevin Costner', 'Linda Hamilton'
    ];
    
    const locations = [
      { pickup: '123 Main St', dropoff: '456 Oak Ave' },
      { pickup: '789 Pine Rd', dropoff: '321 Elm St' },
      { pickup: '555 Broadway', dropoff: '777 Park Ave' },
      { pickup: '999 First St', dropoff: '111 Second St' },
      { pickup: '222 Third Ave', dropoff: '444 Fourth St' }
    ];

    // Generate bookings for the last 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);
      createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

      const location = locations[Math.floor(Math.random() * locations.length)];
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const driverId = drivers[Math.floor(Math.random() * drivers.length)].id;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const fare = parseFloat((Math.random() * 50 + 10).toFixed(2)); // $10-$60

      bookings.push({
        customer_name: customerName,
        pickup_location: location.pickup,
        dropoff_location: location.dropoff,
        fare: fare,
        status: status,
        driver_id: driverId,
        created_at: createdAt,
        updated_at: createdAt
      });
    }

    const createdBookings = await Booking.bulkCreate(bookings);
    console.log(`Created ${createdBookings.length} bookings`);

    // Create missions for completed and in-progress bookings
    const missions = [];
    const missionStatuses = ['assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'];

    for (const booking of createdBookings) {
      if (booking.status === 'completed' || booking.status === 'in_progress' || booking.status === 'confirmed') {
        const startTime = new Date(booking.created_at);
        startTime.setMinutes(startTime.getMinutes() + Math.floor(Math.random() * 15)); // Start 0-15 mins after booking
        
        let endTime = null;
        let missionStatus = 'assigned';
        
        if (booking.status === 'completed') {
          endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 45 + 15)); // 15-60 mins duration
          missionStatus = 'completed';
        } else if (booking.status === 'in_progress') {
          missionStatus = 'in_progress';
        } else {
          missionStatus = missionStatuses[Math.floor(Math.random() * 3)]; // assigned, en_route, or arrived
        }

        missions.push({
          booking_id: booking.id,
          status: missionStatus,
          start_time: startTime,
          end_time: endTime,
          created_at: booking.created_at,
          updated_at: booking.updated_at
        });
      }
    }

    const createdMissions = await Mission.bulkCreate(missions);
    console.log(`Created ${createdMissions.length} missions`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: username="admin", password="password123"');
    console.log('Driver: username="john_driver", password="password123"');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Allow direct execution
if (require.main === module) {
  const { syncDatabase } = require('../models');
  
  async function run() {
    try {
      await syncDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = { seedDatabase };