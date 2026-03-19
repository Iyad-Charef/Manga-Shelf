import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Clear the database before testing
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clear and disconnect
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  const testUser = {
    email: 'testauth@example.com',
    password: 'Password123!',
    username: 'testuser'
  };

  describe('POST /api/auth/register', () => {
    it('should create a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should fail with an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with invalid formatted email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'notanemail',
          password: 'Password123!',
          username: 'bademailuser'
        });

      expect(res.status).toBe(400);
    });

    it('should fail with a password that is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'shortpass@example.com',
          password: 'short',
          username: 'shortpassuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be at least 8 characters');
    });

    it('should fail with a username containing invalid characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'baduser@example.com',
          password: 'Password123!',
          username: 'bad user name *&^'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Username can only contain letters');
    });

    it('should reject extremely massive JSON payloads (DOS protection)', async () => {
      const massiveString = 'a'.repeat(20000); // 20KB username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'dos@example.com',
          password: 'Password123!',
          username: massiveString
        });

      expect(res.status).toBe(413); // Payload Too Large
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login valid user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.user).toHaveProperty('id');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doesnotexist@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject access without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized - No token provided');
    });

    it('should reject access with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`jwt=invalid_token_string`]);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized - Invalid token');
    });

    it('should return user data when providing a valid token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
        
      expect(loginRes.status).toBe(200);

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the jwt cookie', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/jwt=;/);
    });
  });
});
