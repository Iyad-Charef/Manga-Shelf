import { z } from 'zod';

export const librarySchema = z.object({
  mangaId: z.string().min(1, 'mangaId is required'),
  status: z.enum(['READING', 'PLANNING', 'COMPLETED', 'DROPPED', 'ON_HOLD', 'LIKED', 'READ']),
});

export const progressSchema = z.object({
  mangaId: z.string().min(1, 'mangaId is required'),
  chaptersRead: z.number().int().min(0, 'Chapters cannot be negative'),
  volumesRead: z.number().int().min(0).optional().default(0),
});

export const ratingSchema = z.object({
  mangaId: z.string().min(1, 'mangaId is required'),
  score: z.number().int().min(1, 'Score must be at least 1').max(10, 'Score must be at most 10'),
});

export const commentSchema = z.object({
  mangaId: z.string().min(1, 'mangaId is required'),
  text: z.string().min(1, 'Comment text is required').max(1000, 'Comment too long'),
});
