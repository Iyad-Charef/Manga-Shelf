import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { librarySchema, progressSchema, ratingSchema, commentSchema } from '../validators/manga';
import * as mangaService from '../services/manga';
import prisma from '../prisma';

export const addToLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = librarySchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const entry = await mangaService.upsetLibraryEntry(userId, parsed.data.mangaId, parsed.data.status);
    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add to library' });
  }
};

export const removeFromLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const mangaId = req.params.mangaId;

    if (!mangaId) return res.status(400).json({ error: 'mangaId is required' });

    await mangaService.deleteLibraryEntry(userId, mangaId as string);
    res.json({ message: 'Removed from library successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Manga not found in library' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to remove from library' });
  }
};

export const getLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const library = await mangaService.getUserLibrary(userId);
    res.json(library);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
};

export const setProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = progressSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const progress = await mangaService.updateMangaProgress(
      userId, 
      parsed.data.mangaId, 
      parsed.data.chaptersRead, 
      parsed.data.volumesRead
    );
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

export const rateManga = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = ratingSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const rating = await mangaService.upsertMangaRating(userId, parsed.data.mangaId, parsed.data.score);
    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to rate manga' });
  }
};

export const commentManga = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = commentSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const comment = await mangaService.createMangaComment(userId, parsed.data.mangaId, parsed.data.text);
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
};

export const getMangaDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Could be optional if route wasn't completely locked, but it is locked.
    const mangaId = req.params.mangaId;

    if (!mangaId) return res.status(400).json({ error: 'mangaId is required' });

    // Community data (comments + average rating)
    const communityData = await mangaService.fetchMangaCommunityData(mangaId as string);

    // User specific metadata (if logged in)
    let userStats = null;
    if (userId) {
      const [library, progress, rating] = await Promise.all([
        prisma.mangaLibrary.findUnique({ where: { userId_mangaId: { userId, mangaId: mangaId as string } } }),
        prisma.progress.findUnique({ where: { userId_mangaId: { userId, mangaId: mangaId as string } } }),
        prisma.rating.findUnique({ where: { userId_mangaId: { userId, mangaId: mangaId as string } } }),
      ]);

      userStats = {
        libraryStatus: library?.status || null,
        chaptersRead: progress?.chaptersRead || 0,
        volumesRead: progress?.volumesRead || 0,
        userRating: rating?.score || null,
      };
    }

    res.json({
      community: communityData,
      user: userStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch manga details' });
  }
};
