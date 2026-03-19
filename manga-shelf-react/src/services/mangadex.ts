import axios from 'axios';

const MANGADEX_API_URL = 'https://api.mangadex.org';
const UPLOADS_URL = 'https://uploads.mangadex.org';

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: { [key: string]: string };
    description: { [key: string]: string };
    links: { [key: string]: string };
    status: string;
    year: number;
    tags: Array<{ id: string; type: string; attributes: { name: { [key: string]: string } } }>;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
}

export const getCoverUrl = (mangaId: string, coverFileName: string | undefined, size?: '256' | '512') => {
  if (!coverFileName) return '/placeholder-cover.jpg'; // Needs to have a fallback
  const sizeSuffix = size ? `.${size}.jpg` : '';
  return `${UPLOADS_URL}/covers/${mangaId}/${coverFileName}${sizeSuffix}`;
};

export const getMangaTitle = (manga: MangaDexManga) => {
  const titles = manga.attributes.title;
  return titles.en || Object.values(titles)[0] || 'Unknown Title';
};

export const getCoverFileName = (manga: MangaDexManga) => {
  const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
  return coverRel?.attributes?.fileName;
};

export const searchManga = async (query: string, limit = 20): Promise<MangaDexManga[]> => {
  const response = await axios.get(`${MANGADEX_API_URL}/manga`, {
    params: {
      title: query,
      limit,
      'includes[]': ['cover_art', 'author'],
      'order[relevance]': 'desc',
    },
  });
  return response.data.data;
};

export const getMangaDetails = async (id: string): Promise<MangaDexManga> => {
  const response = await axios.get(`${MANGADEX_API_URL}/manga/${id}`, {
    params: {
      'includes[]': ['cover_art', 'author', 'artist'],
    },
  });
  return response.data.data;
};

export const getMangaList = async (ids: string[]): Promise<MangaDexManga[]> => {
  if (!ids || ids.length === 0) return [];
  
  const response = await axios.get(`${MANGADEX_API_URL}/manga`, {
    params: {
      ids,
      limit: ids.length,
      'includes[]': ['cover_art', 'author'],
    },
  });
  return response.data.data;
};
