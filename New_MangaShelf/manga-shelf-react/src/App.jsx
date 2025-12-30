// src/App.js
import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MangaGrid from './components/MangaGrid';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SuccessMessage from './components/SuccessMessage';
import Login from './components/Login';
import Register from './components/Register';
import { searchManga, fetchLibrary, addToLibrary, removeFromLibrary, checkHealth } from './services/api';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [searchResults, setSearchResults] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth();
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
      } catch (err) {
        setBackendStatus('disconnected');
        setError('Cannot connect to backend. Make sure the server is running on port 5000.');
      }
    };
    checkBackend();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-hide error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch library when view changes (only if authenticated)
  useEffect(() => {
    if ((currentView === 'read' || currentView === 'liked') && isAuthenticated) {
      handleFetchLibrary(currentView);
    }
  }, [currentView, isAuthenticated]);

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters to search.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await searchManga(query);
      setSearchResults(data.data || []);
      setCurrentView('home');
      
      if (data.data.length === 0) {
        setError('No manga found. Try a different search term.');
      }
    } catch (err) {
      setError(err.message || 'Failed to search manga');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLibrary = async (status = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchLibrary(status);
      setLibrary(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch library');
      setLibrary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async (manga, status) => {
    if (!isAuthenticated) {
      setError('Please login to add manga to your library');
      setShowLogin(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await addToLibrary({ ...manga, status });
      setSuccess(`Added to ${status} library!`);
      
      // Refresh library if we're in a library view
      if (currentView === 'read' || currentView === 'liked') {
        handleFetchLibrary(currentView);
      }
    } catch (err) {
      setError(err.message || 'Failed to add manga');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromLibrary = async (id) => {
    if (!isAuthenticated) {
      setError('Please login to manage your library');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await removeFromLibrary(id);
      setSuccess('Removed from library');
      handleFetchLibrary(currentView === 'home' ? null : currentView);
    } catch (err) {
      setError(err.message || 'Failed to remove manga');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Navbar 
        onSearch={handleSearch} 
        onShowLogin={() => setShowLogin(true)}
        onShowRegister={() => setShowRegister(true)}
      />
      
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ Backend disconnected. Start your server with: <code>npm start</code> in backend folder
        </div>
      )}
      
      <div className="app-layout">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        
        <main className="main-content">
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
          {success && <SuccessMessage message={success} />}
          
          <div className={`view ${currentView === 'home' ? 'active' : ''}`}>
            {currentView === 'home' && (
              <>
                <div className="view-header">
                  <h1>Welcome to Manga Library Tracker</h1>
                  <p>Search for manga titles using the MangaDex API and manage your personal library</p>
                </div>
                <MangaGrid 
                  manga={searchResults}
                  viewType="search"
                  onAddToLibrary={handleAddToLibrary}
                  onRemoveFromLibrary={handleRemoveFromLibrary}
                  emptyMessage="Search for manga to get started!"
                />
              </>
            )}
          </div>

          <div className={`view ${currentView === 'read' ? 'active' : ''}`}>
            {currentView === 'read' && (
              <>
                <div className="view-header">
                  <h1>Read Library</h1>
                  <p>Manga you've marked as read</p>
                </div>
                <MangaGrid 
                  manga={library}
                  viewType="library"
                  onAddToLibrary={handleAddToLibrary}
                  onRemoveFromLibrary={handleRemoveFromLibrary}
                  emptyMessage="No manga in read library. Start adding manga you've read!"
                />
              </>
            )}
          </div>

          <div className={`view ${currentView === 'liked' ? 'active' : ''}`}>
            {currentView === 'liked' && (
              <>
                <div className="view-header">
                  <h1>Liked Library</h1>
                  <p>Manga you want to read</p>
                </div>
                <MangaGrid 
                  manga={library}
                  viewType="library"
                  onAddToLibrary={handleAddToLibrary}
                  onRemoveFromLibrary={handleRemoveFromLibrary}
                  emptyMessage="No manga in liked library. Start adding manga you want to read!"
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;