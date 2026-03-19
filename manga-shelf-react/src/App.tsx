import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { useAuth } from './context/AuthContext';
import api from './api/client';
import { useQuery } from '@tanstack/react-query';
import { searchManga } from './services/mangadex';
import { MangaCard } from './components/MangaCard';
import { MangaDetails } from './pages/MangaDetails';
import { Profile } from './pages/Profile';
import { Library } from './pages/Library';
import { Loader2, Search } from 'lucide-react';

const Home = () => {
    const [query, setQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('manga'); 

    const { data: mangas, isLoading } = useQuery({
        queryKey: ['search', searchTerm],
        queryFn: () => searchManga(searchTerm),
        enabled: !!searchTerm
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchTerm(query);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-[60vh] p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="text-center mb-10 w-full max-w-2xl mt-12">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-foreground drop-shadow-sm">Find Your Next Story.</h1>
                <p className="text-lg text-muted-foreground mb-8 opacity-90">
                Discover, track, and engage with the cleanest premium reading experience.
                </p>
                
                <form onSubmit={handleSearch} className="flex gap-2 mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for manga..." 
                        className="flex h-14 w-full rounded-full border border-border bg-card/50 backdrop-blur-sm pl-12 pr-4 text-base shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-card"
                    />
                </form>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : mangas && mangas.length > 0 ? (
                <div className="w-full mt-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-md text-sm uppercase tracking-widest">Trending</span>
                        Results for "{searchTerm}"
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
                        {mangas.map((manga) => (
                            <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const AuthForm = ({ title, type }: { title: string, type: 'login' | 'register' }) => {
    const navigate = useNavigate();
    const { refetch } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (type === 'login') {
                await api.post('/auth/login', { email, password });
            } else {
                await api.post('/auth/register', { email, username, password });
            }
            await refetch();
            navigate('/library');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-[70vh] p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-3xl border border-border/50 shadow-2xl shadow-indigo-500/10">
                <h2 className="text-3xl font-black mb-6 text-center">{title}</h2>
                {error && <div className="mb-4 bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'register' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-muted-foreground">Username (Optional)</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-muted-foreground">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                            required 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-muted-foreground">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 text-sm font-bold mt-4 bg-primary text-white rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {type === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                    
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            type="button" 
                            onClick={() => navigate(type === 'login' ? '/register' : '/login')}
                            className="text-primary font-semibold hover:underline"
                        >
                            {type === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

const Layout = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="library" element={<Library />} />
          <Route path="manga/:id" element={<MangaDetails />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="login" element={<AuthForm title="Welcome Back" type="login" />} />
          <Route path="register" element={<AuthForm title="Create an Account" type="register" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
