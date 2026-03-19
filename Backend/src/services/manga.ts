import prisma from '../prisma';

export const upsetLibraryEntry = async (userId: string, mangaId: string, status: string) => {
  return prisma.mangaLibrary.upsert({
    where: {
      userId_mangaId: { userId, mangaId },
    },
    update: { status },
    create: { userId, mangaId, status },
  });
};

export const deleteLibraryEntry = async (userId: string, mangaId: string) => {
  return prisma.mangaLibrary.delete({
    where: {
      userId_mangaId: { userId, mangaId },
    },
  });
};

export const getUserLibrary = async (userId: string) => {
  return prisma.mangaLibrary.findMany({
    where: { userId },
  });
};

export const updateMangaProgress = async (userId: string, mangaId: string, chaptersRead: number, volumesRead: number) => {
  return prisma.progress.upsert({
    where: {
      userId_mangaId: { userId, mangaId },
    },
    update: { chaptersRead, volumesRead },
    create: { userId, mangaId, chaptersRead, volumesRead },
  });
};

export const upsertMangaRating = async (userId: string, mangaId: string, score: number) => {
  return prisma.rating.upsert({
    where: {
      userId_mangaId: { userId, mangaId },
    },
    update: { score },
    create: { userId, mangaId, score },
  });
};

export const createMangaComment = async (userId: string, mangaId: string, text: string) => {
  return prisma.comment.create({
    data: { userId, mangaId, text },
  });
};

export const fetchMangaCommunityData = async (mangaId: string) => {
  const comments = await prisma.comment.findMany({
    where: { mangaId },
    include: { user: { select: { email: true, username: true, profilePic: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const ratings = await prisma.rating.aggregate({
    where: { mangaId },
    _avg: { score: true },
    _count: { score: true },
  });

  return {
    comments,
    averageRating: ratings._avg.score,
    totalRatings: ratings._count.score,
  };
};
