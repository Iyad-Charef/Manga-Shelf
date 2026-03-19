import { Request, Response } from 'express';
import prisma from '../../prisma';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username as string },
      select: {
        id: true,
        username: true,
        profilePic: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get aggregated stats
    const libraryEntries = await prisma.mangaLibrary.findMany({
      where: { userId: user.id },
      select: { status: true }
    });

    const mangaRead = libraryEntries.filter(entry => entry.status === 'COMPLETED').length;

    const ratingsResponse = await prisma.rating.aggregate({
      where: { userId: user.id },
      _avg: { score: true }
    });

    res.json({
        user: {
            username: user.username,
            profilePic: user.profilePic,
            joinedAt: user.createdAt
        },
        stats: {
           mangaRead,
           averageRating: ratingsResponse._avg.score || 0,
           totalLibrary: libraryEntries.length
        },
        // We can fetch recent activity if needed:
        recentActivity: []
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
};