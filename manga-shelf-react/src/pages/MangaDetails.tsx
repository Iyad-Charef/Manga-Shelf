import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMangaDetails, getCoverFileName, getCoverUrl, getMangaTitle } from '../services/mangadex';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, MessageSquare, BookOpen, Star, Send, User } from 'lucide-react';

export const MangaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'progress' | 'comments'>('progress');
  const [comment, setComment] = useState('');
  const [chapters, setChapters] = useState(0);
  const [rating, setRating] = useState(0);

  const { data: manga, isLoading: mangaLoading } = useQuery({
    queryKey: ['manga', id],
    queryFn: () => getMangaDetails(id!),
    enabled: !!id,
  });

  const { data: dbData } = useQuery({
    queryKey: ['manga-db', id],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const res = await api.get('/manga/' + id + '/details');
      return res.data;
    },
    enabled: !!id && isAuthenticated,
  });

  const submitRatingMutation = useMutation({
    mutationFn: async (score) => {
      const res = await api.post('/manga/rating', { mangaId: id, score });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manga-db', id] }),
  });

  const addLibraryMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.post('/manga/library', { mangaId: id, status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manga-db', id] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (ch: number) => {
      const res = await api.post('/manga/progress', { mangaId: id, chaptersRead: ch });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manga-db', id] }),
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post('/manga/comment', { mangaId: id, text });
      return res.data;
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['manga-db', id] });
    },
  });

  if (mangaLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!manga) return <div className="text-center p-12 text-muted-foreground">Manga not found.</div>;

  const title = getMangaTitle(manga);
  const desc = manga.attributes.description.en || 'No description available.';
  const coverFileName = getCoverFileName(manga);
  const coverUrl = getCoverUrl(manga.id, coverFileName, '512');
  const libraryStatus = dbData?.user?.libraryStatus;
  const comments = dbData?.community?.comments || [];
  const currentProgress = dbData?.user?.chaptersRead || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
        {/* LEFT COLUMN: Cover & Actions */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 bg-card border border-border">
              {coverFileName ? (
                <img src={coverUrl} alt={title} className="w-full object-cover aspect-[2/3]" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">No Cover</div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {!isAuthenticated ? (
                <div className="bg-secondary/50 rounded-xl p-4 text-center text-sm border border-border">
                  <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link> to track reading progress.
                </div>
              ) : (
                <>
                  
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Library Status</label>
                  <select 
                    value={libraryStatus || 'UNREAD'}
                    onChange={(e) => addLibraryMutation.mutate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-card border border-border text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="UNREAD">Not in Library</option>
                    <option value="READING">Reading</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="DROPPED">Dropped</option>
                    <option value="PLANNING">Plan to Read</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => submitRatingMutation.mutate(star)}
                        className={`transition-all ${dbData?.user?.userRating >= star ? 'text-yellow-400' : 'text-muted hover:text-yellow-400/50'}`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                </>
              )}
            </div>
            
            {/* Metadata small */}
            <div className="mt-6 space-y-3 bg-card p-5 rounded-2xl border border-border/50">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                <p className="font-medium capitalize">{manga.attributes.status}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Year</span>
                <p className="font-medium">{manga.attributes.year || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {manga.attributes.tags.slice(0, 5).map(tag => (
                    <span key={tag.id} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-1 rounded-sm">{tag.attributes.name.en}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info & Tabs */}
        <div className="md:col-span-8 lg:col-span-9 space-y-10">
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight tracking-tight drop-shadow-sm">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap opacity-90 max-w-4xl">{desc}</p>
          </div>

          <div className="border-b border-border/50">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('progress')}
                className={"pb-4 text-sm font-bold uppercase tracking-wider flex gap-2 items-center transition-colors border-b-2 " + 
                  (activeTab === 'progress' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
              >
                <BookOpen className="h-4 w-4" /> Reading Progress
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={"pb-4 text-sm font-bold uppercase tracking-wider flex gap-2 items-center transition-colors border-b-2 " + 
                  (activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
              >
                <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
              </button>
            </nav>
          </div>

          <div className="pt-2">
            {activeTab === 'progress' && (
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm max-w-2xl">
                {!isAuthenticated ? (
                  <p className="text-center text-muted-foreground">Please log in to update your progress.</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Chapters Read</h3>
                      <p className="text-sm text-muted-foreground mb-4">Track exactly where you left off.</p>
                      
                      <div className="flex items-center gap-4">
                        <button 
                            onClick={() => updateProgressMutation.mutate(Math.max(0, currentProgress - 1))}
                            className="h-12 w-12 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-xl transition-all"
                        >-</button>
                        <div className="flex-1 max-w-[120px]">
                          <input 
                            type="number" 
                            className="w-full h-12 bg-background border border-border rounded-xl text-center font-bold text-xl focus:ring-2 focus:ring-primary focus:outline-none"
                            value={chapters || currentProgress}
                            onChange={(e) => setChapters(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <button 
                            onClick={() => updateProgressMutation.mutate(currentProgress + 1)}
                            className="h-12 w-12 rounded-full bg-primary hover:bg-indigo-600 text-white flex items-center justify-center font-bold text-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >+</button>
                      </div>
                      
                      {chapters > 0 && chapters !== currentProgress && (
                        <button 
                          onClick={() => {
                            updateProgressMutation.mutate(chapters);
                            setChapters(0);
                          }}
                          className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md transition-all"
                        >
                          Save {chapters} Chapters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-8 max-w-3xl">
                {isAuthenticated && (
                  <div className="flex gap-4">
                     <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center flex-col overflow-hidden border border-primary/30">
                        <User className="h-5 w-5 text-primary" />
                     </div>
                     <div className="flex-1 space-y-3">
                       <textarea
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         placeholder="What are your thoughts on this manga?"
                         className="w-full min-h-[100px] p-4 bg-card border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                       />
                       <button
                         onClick={() => submitCommentMutation.mutate(comment)}
                         disabled={!comment.trim() || submitCommentMutation.isPending}
                         className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-md active:scale-95 ml-auto"
                       >
                         {submitCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                         Post Comment
                       </button>
                     </div>
                  </div>
                )}

                <div className="space-y-6 pt-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to start the discussion!</p>
                  ) : (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-4 group">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {c.user?.profilePic ? (
                             <img src={c.user.profilePic} alt="pic" className="h-full w-full object-cover" />
                          ) : (
                             <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                             <Link to={"/profile/" + c.user.username} className="font-bold text-sm hover:text-primary transition-colors">
                               @{c.user.username || 'user'}
                             </Link>
                             <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-foreground/90 text-sm leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
