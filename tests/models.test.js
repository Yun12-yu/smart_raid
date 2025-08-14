const { Driver, Booking, Mission, User } = require('../models');

describe('Database Models', () => {
  describe('Driver Model', () => {
    it('should create a driver with valid data', async () => {
      const driverData = {
        name: 'John Doe',
        phone: '555-0123',
        status: 'available',
        current_location: 'Downtown'
      };

      const driver = await Driver.create(driverData);

      expect(driver.id).toBeDefined();
      expect(driver.name).toBe(driverData.name);
      expect(driver.phone).toBe(driverData.phone);
      expect(driver.status).toBe(driverData.status);
      expect(driver.current_location).toBe(driverData.current_location);
      expect(driver.created_at).toBeDefined();
    });

    it('should reject driver with invalid status', async () => {
      const driverData = {
        name: 'John Doe',
        phone: '555-0123',
        status: 'invalid_status'
      };

      await expect(Driver.create(driverData)).rejects.toThrow();
    });

    it('should reject driver without required fields', async () => {
      const driverData = {
        phone: '555-0123'
        // missing name
      };

      await expect(Driver.create(driverData)).rejects.toThrow();
    });

    it('should enforce unique phone numbers', async () => {
      const driverData = {
        name: 'John Doe',
        phone: '555-0123',
        status: 'available'
      };

      await Driver.create(driverData);

      // Try to create another driver with same phone
      await expect(Driver.create({
        ...driverData,
        name: 'Jane Doe'
      })).rejects.toThrow();
    });
  });

  describe('Booking Model', () => {
    let driver;

    beforeEach(async () => {
      driver = await Driver.create({
        name: 'Test Driver',
        phone: '555-0123',
        status: 'available'
      });
    });

    it('should create a booking with valid data', async () => {
      const bookingData = {
        customer_name: 'Alice Smith',
        pickup_location: 'Airport',
        dropoff_location: 'Downtown',
        fare: 25.50,
        status: 'pending'
      };

      const booking = await Booking.create(bookingData);

      expect(booking.id).toBeDefined();
      expect(booking.customer_name).toBe(bookingData.customer_name);
      expect(booking.pickup_location).toBe(bookingData.pickup_location);
      expect(booking.dropoff_location).toBe(bookingData.dropoff_location);
      expect(parseFloat(booking.fare)).toBe(bookingData.fare);
      expect(booking.status).toBe(bookingData.status);
      expect(booking.created_at).toBeDefined();
    });

    it('should create booking with driver assignment', async () => {
      const bookingData = {
        customer_name: 'Bob Johnson',
        pickup_location: 'Mall',
        dropoff_location: 'Hospital',
        fare: 15.75,
        status: 'assigned',
        driver_id: driver.id
      };

      const booking = await Booking.create(bookingData);

      expect(booking.driver_id).toBe(driver.id);

      // Test association
      const bookingWithDriver = await Booking.findByPk(booking.id, {
        include: [Driver]
      });

      expect(bookingWithDriver.Driver.name).toBe('Test Driver');
    });

    it('should reject booking with invalid status', async () => {
      const bookingData = {
        customer_name: 'Alice Smith',
        pickup_location: 'Airport',
        dropoff_location: 'Downtown',
        fare: 25.50,
        status: 'invalid_status'
      };

      await expect(Booking.create(bookingData)).rejects.toThrow();
    });
  });

  describe('Mission Model', () => {
    let booking;

    beforeEach(async () => {
      const driver = await Driver.create({
        name: 'Test Driver',
        phone: '555-0123',
        status: 'available'
      });

      booking = await Booking.create({
        customer_name: 'Test Customer',
        pickup_location: 'A',
        dropoff_location: 'B',
        fare: 20.00,
        status: 'assigned',
        driver_id: driver.id
      });
    });

    it('should create a mission with valid data', async () => {
      const missionData = {
        booking_id: booking.id,
        status: 'assigned',
        start_time: new Date(),
        end_time: null
      };

      const mission = await Mission.create(missionData);

      expect(mission.id).toBeDefined();
      expect(mission.booking_id).toBe(booking.id);
      expect(mission.status).toBe(missionData.status);
      expect(mission.start_time).toBeDefined();
      expect(mission.end_time).toBeNull();
    });

    it('should associate mission with booking', async () => {
      const mission = await Mission.create({
        booking_id: booking.id,
        status: 'assigned'
      });

      const missionWithBooking = await Mission.findByPk(mission.id, {
        include: [Booking]
      });

      expect(missionWithBooking.Booking.customer_name).toBe('Test Customer');
    });

    it('should reject mission with invalid status', async () => {
      const missionData = {
        booking_id: booking.id,
        status: 'invalid_status'
      };

      await expect(Mission.create(missionData)).rejects.toThrow();
    });
  });

  describe('User Model', () => {
    let driver;

    beforeEach(async () => {
      driver = await Driver.create({
        name: 'Test Driver',
        phone: '555-0123',
        status: 'available'
      });
    });

    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'driver',
        driver_id: driver.id
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe(userData.role);
      expect(user.driver_id).toBe(driver.id);
    });

    it('should hash password before saving', async () => {
      const userData = {
        username: 'hashtest',
        email: 'hash@example.com',
        password: 'plaintext123',
        role: 'driver'
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe('plaintext123');
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should validate password correctly', async () => {
      const userData = {
        username: 'passtest',
        email: 'pass@example.com',
        password: 'testpassword',
        role: 'admin'
      };

      const user = await User.create(userData);

      // Test correct password
      const isValidCorrect = await user.checkPassword('testpassword');
      expect(isValidCorrect).toBe(true);

      // Test incorrect password
      const isValidIncorrect = await user.checkPassword('wrongpassword');
      expect(isValidIncorrect).toBe(false);
    });

    it('should enforce unique username and email', async () => {
      const userData = {
        username: 'unique',
        email: 'unique@example.com',
        password: 'password123',
        role: 'driver'
      };

      await User.create(userData);

      // Try to create user with same username
      await expect(User.create({
        ...userData,
        email: 'different@example.com'
      })).rejects.toThrow();

      // Try to create user with same email
      await expect(User.create({
        ...userData,
        username: 'different'
      })).rejects.toThrow();
    });

    it('should associate user with driver', async () => {
      const user = await User.create({
        username: 'driveruser',
        email: 'driver@example.com',
        password: 'password123',
        role: 'driver',
        driver_id: driver.id
      });

      const userWithDriver = await User.findByPk(user.id, {
        include: [Driver]
      });

      expect(userWithDriver.Driver.name).toBe('Test Driver');
    });
  });
});