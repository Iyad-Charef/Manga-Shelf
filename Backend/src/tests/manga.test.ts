import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Manga Endpoints', () => {
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clear databases
    await prisma.comment.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.progress.deleteMany({});
    await prisma.mangaLibrary.deleteMany({});
    await prisma.user.deleteMany({});

    // Create user and login to get token
    const testUser = {
      email: 'mangatest@example.com',
      password: 'Password123!',
      username: 'mangatest'
    };

    const registerRes = await request(app).post('/api/auth/register').send(testUser);
    expect(registerRes.status).toBe(201);
    
    authCookie = registerRes.headers['set-cookie'];
    testUserId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.progress.deleteMany({});
    await prisma.mangaLibrary.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  const validMangaId = '00000000-0000-0000-0000-000000000000'; // Fake UUID for test

  describe('Authentication & Security', () => {
    it('should block unauthenticated access to /api/manga/library', async () => {
      const res = await request(app).get('/api/manga/library');
      expect(res.status).toBe(401);
    });

    it('should allow authenticated access to /api/manga/library', async () => {
      const res = await request(app).get('/api/manga/library').set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Library Management', () => {
    it('should add manga to library with valid status', async () => {
      const res = await request(app)
        .post('/api/manga/library')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          status: 'READING'
        });

      expect(res.status).toBe(200);
      expect(res.body.mangaId).toBe(validMangaId);
      expect(res.body.status).toBe('READING');
    });

    it('should fail to add manga with invalid status', async () => {
      const res = await request(app)
        .post('/api/manga/library')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          status: 'INVALID_STATUS'
        });

      expect(res.status).toBe(400);
    });

    it('should update status if manga already in library', async () => {
      const res = await request(app)
        .post('/api/manga/library')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          status: 'COMPLETED'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress correctly', async () => {
      const res = await request(app)
        .post('/api/manga/progress')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          chaptersRead: 15,
          volumesRead: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.chaptersRead).toBe(15);
      expect(res.body.volumesRead).toBe(2);
    });

    it('should fail with negative chapters', async () => {
      const res = await request(app)
        .post('/api/manga/progress')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          chaptersRead: -5
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Ratings', () => {
    it('should successfully add a rating between 1 and 10', async () => {
      const res = await request(app)
        .post('/api/manga/rating')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          score: 8
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(8);
    });

    it('should fail if rating is less than 1', async () => {
      const res = await request(app)
        .post('/api/manga/rating')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          score: 0
        });

      expect(res.status).toBe(400);
    });

    it('should fail if rating is greater than 10', async () => {
      const res = await request(app)
        .post('/api/manga/rating')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          score: 11
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Comments', () => {
    it('should add a comment', async () => {
      const res = await request(app)
        .post('/api/manga/comment')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          text: 'This is a test comment.'
        });

      expect(res.status).toBe(201);
      expect(res.body.text).toBe('This is a test comment.');
    });

    it('should fail if comment is empty', async () => {
      const res = await request(app)
        .post('/api/manga/comment')
        .set('Cookie', authCookie)
        .send({
          mangaId: validMangaId,
          text: ''
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Removal', () => {
    it('should remove manga from library', async () => {
      const res = await request(app)
        .delete(`/api/manga/library/${validMangaId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);

      // Verify it's no longer in library
      const libRes = await request(app)
        .get('/api/manga/library')
        .set('Cookie', authCookie);
        
      expect(libRes.body).toHaveLength(0);
    });

    it('should return 404 when removing non-existent manga', async () => {
      const res = await request(app)
        .delete(`/api/manga/library/fake-id-not-in-db`)
        .set('Cookie', authCookie);

      // Depending on implementation, might be 404 or just 200/idem-potent
      expect(res.status).toBe(404);
    });
  });
});
