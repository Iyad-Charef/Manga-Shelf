import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, refetch } = useAuth();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    refetch();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4">
        <Link to="/" className="flex items-center space-x-2 mr-6 group">
          <BookOpen className="h-7 w-7 text-primary transition-transform group-hover:scale-110 duration-300" />
          <span className="font-bold hidden sm:inline-block text-lg">MangaShelf</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/library" className="text-sm font-semibold hover:text-primary transition-colors">
                  Library
                </Link>
                
                <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 group ml-2 mr-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/40 transition-colors">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt="profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block group-hover:text-primary transition-colors">{user?.username || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-card shadow-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive h-9 px-4 py-2 transition-all"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline-block">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 h-9 px-4 py-2 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};
