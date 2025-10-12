// public/app.js

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const mainContent = document.querySelector('.main-content');
    const navButtons = document.querySelectorAll('.nav-btn');

    // State
    let currentView = 'home';
    let searchResults = [];
    let library = [];
    let filterStatus = null;

    // Helper for API requests
    async function apiRequest(url, options = {}) {
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Unknown error');
            return data;
        } catch (e) {
            showError(e.message);
            throw e;
        }
    }

    // -- SEARCH HANDLING ----------------------------------------------------------------
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length < 2) {
            showError('Enter at least 2 characters to search.');
            return;
        }
        showLoading();
        try {
            const data = await apiRequest(`/api/search?q=${encodeURIComponent(query)}`);
            searchResults = data.data;
            renderResults(searchResults);
            hideError();
        } catch {  }
        hideLoading();
    });

    // -- LIBRARY HANDLING --------------------------------------------------------------
    async function fetchLibrary(status=null) {
        showLoading();
        try {
            let url = '/api/library';
            if (status) url += `?status=${encodeURIComponent(status)}`;
            const data = await apiRequest(url);
            library = data.data;
            renderLibrary(library);
            hideError();
        } catch {  }
        hideLoading();
    }

    async function addToLibrary(manga, status='liked') {
        showLoading();
        try {
            const payload = {...manga, status};
            const res = await apiRequest('/api/library', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            showSuccess('Manga saved!');
            fetchLibrary();
        } catch { }
        hideLoading();
    }

    async function removeFromLibrary(id) {
        showLoading();
        try {
            await apiRequest(`/api/library/${encodeURIComponent(id)}`, { method: 'DELETE' });
            showSuccess('Removed from library');
            fetchLibrary(filterStatus);
        } catch {}
        hideLoading();
    }

    // -- UI RENDERING ------------------------------------------------------------------
    function renderResults(results) {
        mainContent.innerHTML = `
            <h2>Search Results</h2>
            <div class="manga-grid">
                ${results.map(manga => renderCard(manga, 'search')).join('')}
            </div>
        `;
        attachCardHandlers();
    }

    function renderLibrary(lib) {
        mainContent.innerHTML = `
            <h2>Your Library${filterStatus ? ` (${filterStatus})` : ''}</h2>
            <div class="manga-grid">
                ${lib.map(manga => renderCard(manga, 'library')).join('')}
            </div>
        `;
        attachCardHandlers();
    }

    function renderCard(manga, from) {
        // Show English title/description first, fallback to first key
        const title = (manga.title && typeof manga.title === 'object')
            ? manga.title['en'] || Object.values(manga.title)[0] || 'Untitled'
            : manga.title;
        const desc = (manga.description && typeof manga.description === 'object')
            ? manga.description['en'] || Object.values(manga.description)[0] || ''
            : manga.description || '';
        const genres = Array.isArray(manga.genres) ? manga.genres : [];
        const author = manga.author || 'Unknown';

        return `
            <div class="manga-card">
                ${manga.coverImage ? `<img src="${manga.coverImage}" alt="" class="mb-1" style="width:100%;border-radius:8px;object-fit:cover;">` : ''}
                <div class="manga-title">${title}</div>
                <div class="manga-author">By <span class="text-muted">${author}</span></div>
                <div class="manga-description mb-1">${desc.slice(0, 300)}${desc.length > 300 ? '…' : ''}</div>
                <div class="manga-genres mb-1">
                    ${genres.map(tag => `<span class="genre-tag">${tag}</span>`).join('')}
                </div>
                <div class="manga-actions">
                    ${from === 'search' ? `
                        <button class="btn btn--primary btn-save" data-id="${manga.externalId}" data-status="liked">Like</button>
                        <button class="btn btn--secondary btn-save" data-id="${manga.externalId}" data-status="read">Read</button>
                    ` : `
                        <span class="status-badge status-badge--${manga.status}">${manga.status}</span>
                        <button class="btn btn--danger btn--small btn-remove" data-id="${manga._id || manga.id}">Remove</button>
                    `}
                </div>
            </div>
        `;
    }

    function attachCardHandlers() {
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mangaId = btn.getAttribute('data-id');
                const status = btn.getAttribute('data-status');
                // Find selected manga in searchResults
                const found = searchResults.find(m => m.externalId === mangaId || m.id === mangaId);
                if (found) addToLibrary(found, status);
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mangaId = btn.getAttribute('data-id');
                removeFromLibrary(mangaId);
            });
        });
    }

    // -- NAVIGATION --------------------------------------------------------------------
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.getAttribute('data-view');
            filterStatus = (currentView === 'liked' || currentView === 'read') ? currentView : null;
            if (currentView === 'home') {
                mainContent.innerHTML = '<h2>Welcome to Your Manga Library!</h2><p>Search for manga and add them to your library.</p>';
            } else {
                fetchLibrary(filterStatus);
            }
        });
    });

    // -- UI Feedback -------------------------------------------------------------------
    function showError(msg) {
        document.getElementById('error-message').classList.remove('hidden');
        document.getElementById('error-text').textContent = msg;
    }
    function hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }
    function showSuccess(msg) {
        let success = document.getElementById('success-message');
        if (!success) {
            success = document.createElement('div');
            success.id = 'success-message';
            success.className = 'success-message';
            document.body.appendChild(success);
        }
        success.textContent = msg;
        success.classList.remove('hidden');
        setTimeout(() => success.classList.add('hidden'), 2000);
    }
    function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
    function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

    // -- INIT --------------------------------------------------------------------------
    mainContent.innerHTML = '<h2>Welcome to Your Manga Library!</h2><p>Search for manga and add them to your library.</p>';
    console.log('error-message element:', document.getElementById('error-message'));
    console.log('error-text element:', document.getElementById('error-text'));

    // Then try to call hideError
    hideError();
    hideLoading();


    
});
