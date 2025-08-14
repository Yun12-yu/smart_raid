const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dummy Data
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

function findAvailableDriver() {
  return drivers.find(driver => driver.available);
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
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Smart Taxis MVP',
    drivers: drivers.filter(d => d.available),
    recentBookings: bookings.slice(-5).reverse()
  });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard - Smart Taxis'
  });
});

app.get('/book', (req, res) => {
  res.render('booking', { title: 'Book a Taxi' });
});

app.post('/book', (req, res) => {
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
  const driver = findAvailableDriver();
  
  if (!driver) {
    return res.render('booking', {
      title: 'Book a Taxi',
      error: 'No drivers available at the moment. Please try again later.'
    });
  }

  // Create booking
  const booking = {
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
  
  // Mark driver as unavailable
  driver.available = false;
  
  // Create mission
  const mission = {
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
  
  console.log(`📱 New booking created: ${booking.id}`);
  console.log(`🚗 Driver ${driver.name} assigned to mission ${mission.id}`);
  
  // Start mission simulation
  setTimeout(() => {
    simulateMissionProgress(mission.id);
  }, 1000);
  
  res.render('booking-success', {
    title: 'Booking Confirmed',
    booking,
    driver
  });
});

app.get('/missions', (req, res) => {
  res.render('missions', {
    title: 'Active Missions',
    missions: missions.filter(m => m.status !== 'completed'),
    completedMissions: missions.filter(m => m.status === 'completed').slice(-10)
  });
});

app.get('/drivers', (req, res) => {
  res.render('drivers', {
    title: 'Driver Status',
    drivers
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    availableDrivers: drivers.filter(d => d.available).length,
    activeMissions: missions.filter(m => m.status !== 'completed').length,
    totalBookings: bookings.length,
    completedMissions: missions.filter(m => m.status === 'completed').length
  });
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
    message: 'The page you are looking for does not exist.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on our end.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Taxis MVP server running on port ${PORT}`);
  console.log(`📱 Access the app at: http://localhost:${PORT}`);
  console.log(`👥 Available drivers: ${drivers.filter(d => d.available).length}`);
});

module.exports = app;