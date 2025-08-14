const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Import models and database
const { Driver, Booking, Mission, User, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const AnalyticsService = require('./services/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Authentication routes
app.use('/auth', authRoutes);

// Database initialization
let isDbInitialized = false;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    const dbConnected = await syncDatabase();
    if (dbConnected) {
      isDbInitialized = true;
      console.log('✅ Database connected and synchronized');
    } else {
      console.log('📝 Falling back to in-memory data storage');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('📝 Falling back to in-memory data storage');
  }
};

// Fallback dummy data (for development without DB)
let drivers = [
  { id: 1, name: 'John Smith', available: true, location: 'Downtown', rating: 4.8 },
  { id: 2, name: 'Maria Garcia', available: true, location: 'Airport', rating: 4.9 },
  { id: 3, name: 'Ahmed Hassan', available: false, location: 'Mall', rating: 4.7 },
  { id: 4, name: 'Lisa Chen', available: true, location: 'University', rating: 4.6 },
  { id: 5, name: 'David Wilson', available: true, location: 'Hospital', rating: 4.8 }
];

let bookings = [];
let missions = [];

// Helper Functions
function calculateFare(pickup, destination) {
  // Simple fare calculation based on distance simulation
  const baseRate = 5.00;
  const perKmRate = 2.50;
  const estimatedDistance = Math.random() * 20 + 2; // 2-22 km
  const fare = baseRate + (estimatedDistance * perKmRate);
  return {
    fare: parseFloat(fare.toFixed(2)),
    distance: parseFloat(estimatedDistance.toFixed(1))
  };
}

async function findAvailableDriver() {
  if (isDbInitialized) {
    return await Driver.findOne({
      where: { status: 'available' }
    });
  }
  return drivers.find(driver => driver.available);
}

async function getDrivers() {
  if (isDbInitialized) {
    return await Driver.findAll();
  }
  return drivers;
}

async function getBookings(limit = null) {
  if (isDbInitialized) {
    const options = {
      include: [Driver],
      order: [['created_at', 'DESC']]
    };
    if (limit) options.limit = limit;
    return await Booking.findAll(options);
  }
  return limit ? bookings.slice(-limit).reverse() : bookings;
}

async function getMissions() {
  if (isDbInitialized) {
    return await Mission.findAll({
      include: [{
        model: Booking,
        include: [Driver]
      }],
      order: [['created_at', 'DESC']]
    });
  }
  return missions;
}

function simulateMissionProgress(missionId) {
  const mission = missions.find(m => m.id === missionId);
  if (!mission) return;

  const statuses = ['assigned', 'en_route_pickup', 'arrived_pickup', 'passenger_onboard', 'en_route_destination', 'completed'];
  let currentIndex = statuses.indexOf(mission.status);

  if (currentIndex < statuses.length - 1) {
    setTimeout(() => {
      currentIndex++;
      mission.status = statuses[currentIndex];
      mission.updatedAt = new Date();
      
      console.log(`🚗 Mission ${missionId}: Status updated to '${mission.status}'`);
      
      if (mission.status === 'completed') {
        // Make driver available again
        const driver = drivers.find(d => d.id === mission.driverId);
        if (driver) {
          driver.available = true;
          console.log(`✅ Driver ${driver.name} is now available`);
        }
      } else {
        // Continue simulation
        simulateMissionProgress(missionId);
      }
    }, Math.random() * 3000 + 2000); // 2-5 seconds delay
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    const allDrivers = await getDrivers();
    const recentBookings = await getBookings(5);
    
    res.render('index', { 
      title: 'Smart Taxis MVP',
      drivers: isDbInitialized ? 
        allDrivers.filter(d => d.status === 'available') : 
        allDrivers.filter(d => d.available),
      recentBookings
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Unable to load homepage data.',
      status: 500
    });
  }
});

app.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let dashboardData = {};
    
    if (isDbInitialized) {
      dashboardData = await AnalyticsService.getDashboardData();
    } else {
      // Fallback data for development without database
      dashboardData = {
        bookingStats: {
          totalBookings: bookings.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
          totalRevenue: bookings.reduce((sum, b) => sum + (b.fare || 0), 0),
          completionRate: bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0
        },
        dailyTrends: [],
        driverPerformance: drivers.map(d => ({
          id: d.id,
          name: d.name,
          status: d.available ? 'available' : 'busy',
          totalBookings: 0,
          completedBookings: 0,
          revenue: 0,
          completionRate: 0
        })),
        statusDistribution: [],
        peakHours: []
      };
    }
    
    res.render('dashboard', { 
      title: 'Dashboard - Smart Taxis',
      user: req.user,
      analytics: dashboardData
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Unable to load dashboard data.',
      status: 500
    });
  }
});

// API endpoint for dashboard data
app.get('/api/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (isDbInitialized) {
      const data = await AnalyticsService.getDashboardData();
      res.json(data);
    } else {
      res.json({ error: 'Database not initialized' });
    }
  } catch (error) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({ error: 'Unable to fetch analytics data' });
  }
});

app.get('/book', (req, res) => {
  res.render('booking', { title: 'Book a Taxi' });
});

app.post('/book', async (req, res) => {
  try {
  const { pickup, destination, passengerName, passengerPhone } = req.body;
  
  // Validate input
  if (!pickup || !destination || !passengerName || !passengerPhone) {
    return res.render('booking', { 
      title: 'Book a Taxi',
      error: 'All fields are required'
    });
  }

  // Calculate fare
  const fareInfo = calculateFare(pickup, destination);
  
  // Find available driver
  const driver = await findAvailableDriver();
  
  if (!driver) {
    return res.render('booking', {
      title: 'Book a Taxi',
      error: 'No drivers available at the moment. Please try again later.'
    });
  }

  let booking, mission;

  if (isDbInitialized) {
    // Create booking in database
    booking = await Booking.create({
      customer_name: passengerName,
      pickup_location: pickup,
      dropoff_location: destination,
      fare: fareInfo.fare,
      status: 'assigned',
      driver_id: driver.id
    });

    // Update driver status
    await driver.update({ status: 'busy' });

    // Create mission
    mission = await Mission.create({
      booking_id: booking.id,
      status: 'assigned',
      start_time: new Date()
    });

    console.log(`📱 New booking created: ${booking.id}`);
    console.log(`🚗 Driver ${driver.name} assigned to mission ${mission.id}`);
  } else {
    // Fallback to in-memory storage
    booking = {
      id: uuidv4(),
      pickup,
      destination,
      passengerName,
      passengerPhone,
      fare: fareInfo.fare,
      distance: fareInfo.distance,
      status: 'confirmed',
      createdAt: new Date(),
      driverId: driver.id,
      driverName: driver.name
    };

    bookings.push(booking);
    driver.available = false;

    mission = {
      id: uuidv4(),
      bookingId: booking.id,
      driverId: driver.id,
      driverName: driver.name,
      pickup,
      destination,
      passengerName,
      status: 'assigned',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    missions.push(mission);

    // Start mission simulation for in-memory data
    setTimeout(() => {
      simulateMissionProgress(mission.id);
    }, 1000);
  }
  
  res.render('booking-success', {
    title: 'Booking Confirmed',
    booking,
    driver
  });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.render('booking', {
      title: 'Book a Taxi',
      error: 'Unable to create booking. Please try again.'
    });
  }
});

app.get('/missions', authenticateToken, async (req, res) => {
  try {
    const allMissions = await getMissions();
    
    if (isDbInitialized) {
      const activeMissions = allMissions.filter(m => m.status !== 'completed');
      const completedMissions = allMissions.filter(m => m.status === 'completed').slice(-10);
      
      res.render('missions', {
        title: 'Active Missions',
        missions: activeMissions,
        completedMissions,
        user: req.user
      });
    } else {
      res.render('missions', {
        title: 'Active Missions',
        missions: missions.filter(m => m.status !== 'completed'),
        completedMissions: missions.filter(m => m.status === 'completed').slice(-10),
        user: req.user
      });
    }
  } catch (error) {
    console.error('Error loading missions:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Unable to load missions data.',
      status: 500
    });
  }
});

app.get('/drivers', authenticateToken, async (req, res) => {
  try {
    const allDrivers = await getDrivers();
    
    res.render('drivers', {
      title: 'Driver Status',
      drivers: allDrivers,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading drivers:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Unable to load drivers data.',
      status: 500
    });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    if (isDbInitialized) {
      const [availableDrivers, activeMissions, totalBookings, completedMissions] = await Promise.all([
        Driver.count({ where: { status: 'available' } }),
        Mission.count({ where: { status: { [require('sequelize').Op.ne]: 'completed' } } }),
        Booking.count(),
        Mission.count({ where: { status: 'completed' } })
      ]);
      
      res.json({
        availableDrivers,
        activeMissions,
        totalBookings,
        completedMissions
      });
    } else {
      res.json({
        availableDrivers: drivers.filter(d => d.available).length,
        activeMissions: missions.filter(m => m.status !== 'completed').length,
        totalBookings: bookings.length,
        completedMissions: missions.filter(m => m.status === 'completed').length
      });
    }
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Unable to fetch status data' });
  }
});

app.get('/api/missions/:id', (req, res) => {
  const mission = missions.find(m => m.id === req.params.id);
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found' });
  }
  res.json(mission);
});

// Error handling
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    status: 404
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    status: 500
  });
});

// Add login page route
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Smart Taxis' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Smart Taxis MVP server running on port ${PORT}`);
  console.log(`📱 Access the app at: http://localhost:${PORT}`);
  
  // Initialize database
  await initializeDatabase();
  
  if (isDbInitialized) {
    const availableDriversCount = await Driver.count({ where: { status: 'available' } });
    console.log(`👥 Available drivers: ${availableDriversCount}`);
  } else {
    console.log(`👥 Available drivers: ${drivers.filter(d => d.available).length}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (isDbInitialized) {
    const { sequelize } = require('./models');
    await sequelize.close();
  }
  process.exit(0);
});

module.exports = app;