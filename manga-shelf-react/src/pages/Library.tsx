import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowUpDown, Filter } from 'lucide-react';
import api from '../api/client';
import { getMangaList } from '../services/mangadex';
import { MangaCard } from '../components/MangaCard';

export const Library = () => {
    const { isAuthenticated } = useAuth();
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'Date' | 'Rating' | 'Title'>('Date');

    const { data: dbLibraryResponse, isLoading: isLoadingDb } = useQuery({      
      queryKey: ["library"],
      queryFn: async () => {
        const res = await api.get("/manga/library");
        return res.data; 
      },
      enabled: isAuthenticated,
    });

    const mangaIds = dbLibraryResponse?.map((item: any) => item.mangaId) || []; 

    const { data: libraryDetails, isLoading: isLoadingDex } = useQuery({        
      queryKey: ["libraryDetails", mangaIds],
      queryFn: () => getMangaList(mangaIds),
      enabled: mangaIds.length > 0,
    });

    const refinedLibrary = useMemo(() => {
        if (!libraryDetails || !dbLibraryResponse) return [];
        
        let merged = libraryDetails.map(manga => {
            const dbMatch = dbLibraryResponse.find((item: any) => item.mangaId === manga.id);
            return {
                ...manga,
                libraryStatus: dbMatch?.status || 'UNKNOWN',
                addedAt: new Date(dbMatch?.createdAt || Date.now()).getTime(),
            };
        });

        if (filterStatus !== 'ALL') {
            merged = merged.filter(m => m.libraryStatus === filterStatus);
        }

        merged.sort((a, b) => {
            if (sortBy === 'Date') return b.addedAt - a.addedAt;
            // Sorting by Title
            return (a.attributes.title.en || '').localeCompare(b.attributes.title.en || '');
        });

        return merged;
    }, [libraryDetails, dbLibraryResponse, filterStatus, sortBy]);


    if (!isAuthenticated) return (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[70vh]">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-md">Restricted Access</h2>        
          <p className="text-muted-foreground text-lg">Please log in to build and manage your premium library.</p>
        </div>
    );

    const isLoading = isLoadingDb || (mangaIds.length > 0 && isLoadingDex);     

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full min-h-[80vh]">        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border/50 pb-6 gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-sm mb-2">My Library</h1>
                <p className="text-muted-foreground text-lg">{mangaIds.length} titles saved</p>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="READING">Reading</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PLANNING">Plan to Read</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="DROPPED">Dropped</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                    >
                        <option value="Date">Recently Added</option>
                        <option value="Title">Alphabetical</option>
                    </select>
                </div>
            </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : refinedLibrary.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {refinedLibrary.map((manga) => (
              <MangaCard 
                key={manga.id} 
                manga={manga} 
                libraryStatus={manga.libraryStatus} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-card border border-border rounded-3xl shadow-sm mt-8">
            <h3 className="text-2xl font-bold mb-2">No Manga Found</h3>
            <p className="text-muted-foreground">Try tweaking your filters or discovering new series on the home page.</p>
          </div>
        )}
      </div>
    );
};
