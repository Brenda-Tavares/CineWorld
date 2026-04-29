// Favorites - now using Supabase
function toggleFavorite(movieId) {
    if (!currentUser) {
        alert(t('loginFirst') || 'Por favor, entre na sua conta para adicionar favoritos!');
        openLoginModal();
        return;
    }
    
    // Toggle local first for UX
    const index = favorites.indexOf(movieId);
    const isAdding = index === -1;
    
    if (isAdding) {
        favorites.push(movieId);
    } else {
        favorites.splice(index, 1);
    }
    
    // Update UI immediately
    updateFavoritesCount();
    renderMovies();
    
    // Update modal if open
    const modal = document.getElementById('movieModal');
    if (modal.classList.contains('open')) {
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) showMovieModal(movie);
    }
    
    // Sync with Supabase (defined in supabase-favorites.js)
    if (typeof toggleFavoriteSupabase === 'function') {
        toggleFavoriteSupabase(movieId, isAdding).catch(err => {
            console.error('Supabase sync error:', err);
            // Revert on error
            if (isAdding) {
                const idx = favorites.indexOf(movieId);
                if (idx !== -1) favorites.splice(idx, 1);
            } else {
                favorites.push(movieId);
            }
            updateFavoritesCount();
            renderMovies();
            alert('Erro ao sincronizar favoritos. Tente novamente.');
        });
    }
}

function updateFavoritesCount() {
    const count = document.getElementById('favCount');
    if (count) {
        count.textContent = favorites.length;
    }
}

function showFavorites() {
    if (favorites.length === 0) {
        alert(t('noFavorites') || 'Você ainda não tem filmes favoritos!');
        return;
    }
    
    const favMovies = state.movies.filter(m => favorites.includes(m.id));
    if (favMovies.length > 0) {
        state.movies = favMovies;
        renderMovies();
        document.getElementById('currentTitle').textContent = t('myFavorites') || 'Meus Favoritos';
        document.getElementById('moviesCount').textContent = favMovies.length + ' ' + t('movies');
    }
}

// Auth
function initAuth() {
    const savedUser = localStorage.getItem('cineworld_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
        
        // Load favorites from Supabase if available
        if (typeof loadFavoritesFromSupabase === 'function') {
            loadFavoritesFromSupabase().catch(err => {
                console.error('Error loading from Supabase:', err);
                // Fallback to localStorage
                const savedFavorites = localStorage.getItem('cineworld_favorites');
                if (savedFavorites) {
                    favorites = JSON.parse(savedFavorites);
                    updateFavoritesCount();
                    renderMovies();
                }
            });
        } else {
            // Fallback to localStorage
            const savedFavorites = localStorage.getItem('cineworld_favorites');
            if (savedFavorites) {
                favorites = JSON.parse(savedFavorites);
                updateFavoritesCount();
                renderMovies();
            }
        }
    } else {
        // No user, load from localStorage
        const savedFavorites = localStorage.getItem('cineworld_favorites');
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
            updateFavoritesCount();
            renderMovies();
        }
    }
}

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.setAttribute('data-theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        html.setAttribute('data-theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

// Contact
function openContactModal() {
    document.getElementById('contactModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('open');
    document.body.style.overflow = '';
}

window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;

function submitContact(e) {
    e.preventDefault();
    const formUrl = 'https://formspree.io/f/mjkyanwk';
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    fetch(formUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(response => {
        if (response.ok) {
            alert(t('contactSuccess') || 'Formulário enviado com sucesso!');
            form.reset();
            closeContactModal();
        } else {
            alert(t('contactError') || 'Erro ao enviar. Tente novamente.');
        }
    }).catch(() => {
        window.open(formUrl.replace('/f/', '/p/'), '_blank');
        alert(t('contactOpenForm') || 'O formulário foi aberto! Por favor, preencha e envie.');
        form.reset();
        closeContactModal();
    });
}

console.log('CineWorld script loaded successfully');
