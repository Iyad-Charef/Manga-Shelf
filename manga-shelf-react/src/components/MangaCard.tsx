import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Check, Loader2 } from 'lucide-react';
import { MangaDexManga, getMangaTitle, getCoverFileName, getCoverUrl } from '../services/mangadex';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

interface MangaCardProps {
  manga: MangaDexManga;
  libraryStatus?: string;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, libraryStatus }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const title = getMangaTitle(manga);
  const coverFileName = getCoverFileName(manga);
  const coverUrl = getCoverUrl(manga.id, coverFileName, '512'); // Higher res

  const addMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.post('/manga/library', {
        mangaId: manga.id,
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        alert("Please login to add to your library.");
        return;
    }
    addMutation.mutate('READING');
  };

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted relative">
        {coverFileName ? (
          <img
            src={coverUrl}
            alt={`${title} cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-neutral-800">
            No Cover
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
            {manga.attributes.year && (
                <span className="backdrop-blur-md bg-black/40 text-white/90 text-xs font-semibold px-2 py-1 rounded-full border border-white/10">
                    {manga.attributes.year}
                </span>
            )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={addMutation.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md bg-black/30 hover:bg-indigo-600 border border-white/20 text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
            title={libraryStatus ? `Currently: ${libraryStatus}` : `Quick Add to Library`}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : libraryStatus ? (
              <Check className="h-5 w-5 text-indigo-400" />
            ) : (
              <Heart className="h-5 w-5 hover:fill-current" />
            )}
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left inset-x-0 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-md mb-2" title={title}>
                {title}
            </h3>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                    manga.attributes.status === 'ongoing' ? 'bg-indigo-500 text-white' : 
                    manga.attributes.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                    {manga.attributes.status || 'Ongoing'}
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
};