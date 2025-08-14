const request = require('supertest');
const express = require('express');
const { User } = require('../models');
const authRoutes = require('../routes/auth');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Test protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

app.get('/admin-only', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

describe('Authentication System', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'driver'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser'
          // missing email and password
        })
        .expect(400);

      expect(response.body.error).toBe('Username, email, and password are required');
    });

    it('should reject registration with duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        email: 'first@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same username
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...userData,
          email: 'second@example.com'
        })
        .expect(409);

      expect(response.body.error).toBe('Username or email already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123',
        role: 'driver'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('logintest');
    });

    it('should login with email instead of username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'logintest'
          // missing password
        })
        .expect(400);

      expect(response.body.error).toBe('Username and password are required');
    });
  });

  describe('Protected Routes', () => {
    let authToken;
    let adminToken;

    beforeEach(async () => {
      // Create test users
      const driverUser = await User.create({
        username: 'driver',
        email: 'driver@example.com',
        password: 'password123',
        role: 'driver'
      });

      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });

      // Get tokens
      const driverResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'driver',
          password: 'password123'
        });
      authToken = driverResponse.body.token;

      const adminResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'password123'
        });
      adminToken = adminResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Access granted');
      expect(response.body.user.id).toBeDefined();
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);

      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should allow admin access to admin-only route', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin access granted');
    });

    it('should reject driver access to admin-only route', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});