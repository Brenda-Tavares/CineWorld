/**
 * CINEWORLD - Frontend
 */

// Google Login callback
function handleGoogleLogin(response) {
    if (response.credential) {
        const decoded = JSON.parse(atob(response.credential.split('.')[1]));
        const user = {
            id: 'google_' + decoded.sub,
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            provider: 'google'
        };
        
        currentUser = user;
        localStorage.setItem('cineworld_user', JSON.stringify(user));
        
        updateAuthUI();
        closeLoginModal();
        
        alert('Bem-vindo, ' + user.name + '!');
    }
}

// Usa a API do Vercel em qualquer ambiente (local ou produção)
const API_BASE = '/api';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Traduções do site
const translations = {
    'pt-BR': {
        searchPlaceholder: 'Buscar filmes...',
        popular: 'Populares', bestRated: 'Melhores Avaliados', worstRated: 'Piores Avaliados', release: 'Lançamentos',
        all: 'Todos', national: 'Nacionais', international: 'Internacionais', originLabel: 'Filmes:',
        genres: 'Gêneros', movies: 'filmes', page: 'Pagina', of: 'de',
        language: 'Idioma:',
        prev: 'Anterior', next: 'Proxima', details: 'Detalhes',
        rating: 'Avaliação', year: 'Ano', synopsis: 'Sinopse',
        originalTitle: 'Titulo original', close: 'Fechar',
        noResults: 'Nenhum filme encontrado', tryAgain: 'Tente outro genero ou busca',
        login: 'Entrar', logout: 'Sair', loginTitle: 'Entrar',
        loginDesc: 'Escolha uma opção para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Onde Assistir', runtime: 'min',
        favorites: 'Favoritos', noFavorites: 'Voce ainda nao tem favoritos!',
        welcome: 'Bem-vindo', sortBy: 'Ordenar',
        contact: 'Contato', contactTitle: 'Fale Conosco', contactDesc: 'Envie suas sugestões, elogios ou reclamações',
        name: 'Nome (opcional)', type: 'Tipo', message: 'Mensagem *', send: 'Enviar',
        suggestion: 'Sugestão', compliment: 'Elogio', complaint: 'Reclamação', other: 'Outro'
    },
    'en': {
        searchPlaceholder: 'Search movies...',
        popular: 'Popular', bestRated: 'Top Rated', worstRated: 'Lowest Rated', release: 'New Releases',
        all: 'All', national: 'National', international: 'International',
        genres: 'Genres', movies: 'movies', page: 'Page', of: 'of',
        language: 'Language:',
        prev: 'Previous', next: 'Next', details: 'Details',
        rating: 'Rating', year: 'Year', synopsis: 'Synopsis',
        originalTitle: 'Original title', close: 'Close',
        noResults: 'No movies found', tryAgain: 'Try another genre or search',
        login: 'Sign In', logout: 'Sign Out', loginTitle: 'Sign In',
        loginDesc: 'Choose an option to continue',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Watch On', runtime: 'min',
        favorites: 'Favorites', noFavorites: 'You have no favorites yet!',
        welcome: 'Welcome', sortBy: 'Sort',
        contact: 'Contact', contactTitle: 'Contact Us', contactDesc: 'Send your suggestions, compliments or complaints',
        name: 'Name (optional)', type: 'Type', message: 'Message *', send: 'Send',
        suggestion: 'Suggestion', compliment: 'Compliment', complaint: 'Complaint', other: 'Other'
    },
    'es': {
        searchPlaceholder: 'Buscar peliculas...',
        popular: 'Peliculas Populares', rating: 'Mejor Valoradas', release: 'Mas Recientes',
        all: 'Todos', national: 'Nacionales', international: 'Internacionales',
        genres: 'Géneros', movies: 'peliculas', page: 'Pagina', of: 'de',
        language: 'Idioma:',
        prev: 'Anterior', next: 'Siguiente', details: 'Detalles',
        rating: 'Valoracion', year: 'Ano', synopsis: 'Sinopsis',
        originalTitle: 'Titulo original', close: 'Cerrar',
        noResults: 'No se encontraron peliculas', tryAgain: 'Intenta otro genero o busqueda',
        login: 'Entrar', logout: 'Salir', loginTitle: 'Entrar',
        loginDesc: 'Elige una opcion para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Ver en', runtime: 'min',
        favorites: 'Favoritos', noFavorites: '¡Aun no tienes favoritos!',
        welcome: 'Bienvenido', sortBy: 'Ordenar'
    },
    'zh-CN': {
        searchPlaceholder: '搜索电影...',
        popular: '热门电影', rating: '评分最高', release: '最新',
        all: '全部', national: '国产', international: '国际',
        genres: '类型', movies: '部电影', page: '第', of: '页，共',
        language: '语言:',
        prev: '上一页', next: '下一页', details: '详情',
        rating: '评分', year: '年份', synopsis: '简介',
        originalTitle: '原名', close: '关闭',
        noResults: '未找到电影', tryAgain: '尝试其他类型或搜索',
        login: '登录', logout: '退出', loginTitle: '登录',
        loginDesc: '选择一个选项继续',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '在线观看', runtime: '分钟',
        favorites: '收藏', noFavorites: '还没有收藏！',
        welcome: '欢迎', sortBy: '排序'
    },
    'zh-HK': {
        searchPlaceholder: '搜尋電影...',
        popular: '熱門電影', rating: '評分最高', release: '最新',
        all: '全部', national: '本土', international: '國際',
        genres: '類型', movies: '部電影', page: '第', of: '頁，共',
        language: '語言:',
        prev: '上一頁', next: '下一頁', details: '詳情',
        rating: '評分', year: '年份', synopsis: '簡介',
        originalTitle: '原名', close: '關閉',
        noResults: '未找到電影', tryAgain: '嘗試其他類型或搜尋',
        login: '登入', logout: '登出', loginTitle: '登入',
        loginDesc: '選擇一個選項繼續',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '線上觀看', runtime: '分鐘',
        favorites: '收藏', noFavorites: '還沒有收藏！',
        welcome: '歡迎', sortBy: '排序'
    },
    'ja': {
        searchPlaceholder: '映画を検索...',
        popular: '人気映画', rating: '高評価', release: '最新作',
        all: 'すべて', national: '日本', international: '外国',
        genres: 'ジャンル', movies: '映画', page: 'ページ', of: '/',
        language: '言語:',
        prev: '前へ', next: '次へ', details: '詳細',
        rating: '評価', year: '年', synopsis: 'あらすじ',
        originalTitle: '原題', close: '閉じる',
        noResults: '映画が見つかりません', tryAgain: '他のジャンルで検索',
        login: 'ログイン', logout: 'ログアウト', loginTitle: 'ログイン',
        loginDesc: 'オプションを選択してください',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '視聴', runtime: '分',
        favorites: 'お気に入り', noFavorites: 'お気に入りはまだありません！',
        welcome: 'ようこそ', sortBy: '並べ替え'
    },
    'ru': {
        searchPlaceholder: 'Поиск фильмов...',
        popular: 'Популярные фильмы', rating: 'Лучшие оценки', release: 'Новейшие',
        all: 'Все', national: 'Национальные', international: 'Международные',
        genres: 'Жанры', movies: 'фильмов', page: 'Страница', of: 'из',
        language: 'Язык:',
        prev: 'Предыдущая', next: 'Следующая', details: 'Детали',
        rating: 'Рейтинг', year: 'Год', synopsis: 'Описание',
        originalTitle: 'Оригинальное название', close: 'Закрыть',
        noResults: 'Фильмы не найдены', tryAgain: 'Попробуйте другой жанр или поиск',
        login: 'Войти', logout: 'Выйти', loginTitle: 'Войти',
        loginDesc: 'Выберите вариант',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Смотреть', runtime: 'мин',
        favorites: 'Избранное', noFavorites: 'У вас пока нет избранного!',
        welcome: 'Добро пожаловать', sortBy: 'Сортировать'
    },
    'ko': {
        searchPlaceholder: '영화 검색...',
        popular: '인기 영화', rating: '높은 평점', release: '최신',
        all: '전체', national: '국내', international: '해외',
        genres: '장르', movies: '편', page: '페이지', of: '/',
        language: '언어:',
        prev: '이전', next: '다음', details: '상세정보',
        rating: '평점', year: '연도', synopsis: '시놉시스',
        originalTitle: '원제', close: '닫기',
        noResults: '영화를 찾을 수 없습니다', tryAgain: '다른 장르 또는 검색을 시도하세요',
        login: '로그인', logout: '로그아웃', loginTitle: '로그인',
        loginDesc: '옵션을 선택하세요',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '시청', runtime: '분',
        favorites: '즐겨찾기', noFavorites: '즐겨찾기가 아직 없습니다!',
        welcome: '환영합니다', sortBy: '정렬'
    }
};

// Função para obter tradução
function t(key) {
    const lang = translations[state.currentLanguage] || translations['pt-BR'];
    return lang[key] || translations['pt-BR'][key] || key;
}

// Estado
let state = {
    currentGenre: '0',
    currentPage: 1,
    totalPages: 1,
    movies: [],
    genres: [],
    searchQuery: '',
    currentSort: 'popularity',
    currentOrigin: 'all',
    currentLanguage: 'pt-BR',
    isLoading: false
};

// Usuario
let currentUser = null;
let favorites = [];

// Mapeamento de idiomas
const languageMap = {
    'pt-BR': 'pt-BR',
    'en': 'en-US',
    'es': 'es-ES',
    'zh-CN': 'zh-CN',
    'zh-HK': 'zh-TW',
    'ja': 'ja-JP',
    'ru': 'ru-RU',
    'ko': 'ko-KR'
};

// Inicializacao
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    loadFromURL();
    setupEvents();
    loadData();
    
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
});

// Carregar estado da URL
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('page')) {
        state.currentPage = parseInt(params.get('page')) || 1;
    }
    if (params.has('sort')) {
        state.currentSort = params.get('sort');
    }
    if (params.has('genre')) {
        state.currentGenre = params.get('genre');
    }
    if (params.has('origin')) {
        state.currentOrigin = params.get('origin');
    }
    if (params.has('lang')) {
        state.currentLanguage = params.get('lang');
    }
    
    // Atualiza a UI com os valores da URL
    updateUIFromState();
}

function updateUIFromState() {
    // Atualiza botões de origem
    document.querySelectorAll('#filterOrigin .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.origin === state.currentOrigin);
    });
    
    // Atualiza botões de ordenação
    document.querySelectorAll('#filterSort .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === state.currentSort);
    });
    
    // Atualiza select de idioma
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = state.currentLanguage;
    }
    
    // Atualiza selects de filtro
    const originSelect = document.getElementById('filterOriginSelect');
    if (originSelect) originSelect.value = state.currentOrigin;
    
    const sortSelect = document.getElementById('filterSortSelect');
    if (sortSelect) sortSelect.value = state.currentSort;
    
    // Atualiza gêneros
    document.querySelectorAll('.genre-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === state.currentGenre);
    });
}

// Atualizar URL
function updateURL() {
    const params = new URLSearchParams();
    
    if (state.currentPage > 1) params.set('page', state.currentPage);
    if (state.currentSort !== 'popularity') params.set('sort', state.currentSort);
    if (state.currentGenre !== '0') params.set('genre', state.currentGenre);
    if (state.currentOrigin !== 'all') params.set('origin', state.currentOrigin);
    if (state.currentLanguage !== 'pt-BR') params.set('lang', state.currentLanguage);
    
    const newURL = params.toString() ? '?' + params.toString() : window.location.pathname;
    window.history.replaceState({}, '', newURL);
}

// Eventos
function setupEvents() {
    // Busca
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Permite digitar e buscar ao mesmo tempo
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                performSearch();
            }
        });
    }
    
    // Idioma
    document.getElementById('langSelect').addEventListener('change', function() {
        state.currentLanguage = this.value;
        state.currentPage = 1;
        
        // Atualiza label de idioma
        const langLabel = document.getElementById('langLabel');
        if (langLabel) {
            langLabel.textContent = t('language') || 'Idioma:';
        }
        
        // Atualiza o texto do título
        updateTitle();
        
        // Recarrega géneros e filmes
        loadData();
    });
    
    // Login
    document.getElementById('authBtn').addEventListener('click', openLoginModal);
    
    // Favoritos
    document.getElementById('favoritesBtn').addEventListener('click', showFavorites);
    
    // Filtro de origem (select)
    document.getElementById('filterOriginSelect').addEventListener('change', function() {
        state.currentOrigin = this.value;
        state.currentPage = 1;
        loadMovies();
    });
    
    // Filtro de ordenação (select)
    document.getElementById('filterSortSelect').addEventListener('change', function() {
        state.currentSort = this.value;
        state.currentPage = 1;
        loadMovies();
    });
    
    // Filtro de gênero (mobile select)
    document.getElementById('genreSelectMobile').addEventListener('change', function() {
        state.currentGenre = this.value;
        state.currentPage = 1;
        state.searchQuery = '';
        document.getElementById('searchInput').value = '';
        
        updateTitle();
        loadMovies();
    });
    
    // Paginação
    document.getElementById('prevPage').addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            loadMovies();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            loadMovies();
        }
    });
    
    // Fechar modais
    document.getElementById('movieModal').addEventListener('click', function(e) {
        if (e.target === this) closeMovieModal();
    });
    
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) closeLoginModal();
    });
    
    // ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMovieModal();
            closeLoginModal();
            closeContactModal();
        }
    });
    
    // Fechar modal contact ao clicar fora
    document.getElementById('contactModal').addEventListener('click', function(e) {
        if (e.target === this) closeContactModal();
    });
}

// Busca
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    state.searchQuery = query;
    state.currentPage = 1;
    state.currentGenre = '0';
    loadMovies();
}

// Carregar dados
async function loadData() {
    try {
        // Generos
        const genresRes = await fetch(API_BASE + '/genres?language=' + state.currentLanguage);
        const genresData = await genresRes.json();
        
        if (Array.isArray(genresData)) {
            state.genres = genresData;
            renderGenres();
            updateGenreUIFromState();
        }
        
        // Filmes
        await loadMovies();
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

function updateGenreUIFromState() {
    document.querySelectorAll('.genre-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === state.currentGenre);
    });
}

// Carregar filmes
async function loadMovies() {
    if (state.isLoading) return;
    state.isLoading = true;
    
    try {
        // Mapeia idioma para formato TMDB
        const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
        let url = API_BASE + '/movies?page=' + state.currentPage + '&sort=' + state.currentSort + '&language=' + tmdbLang;
        
        console.log('>>> loadMovies URL:', url, 'page param:', state.currentPage);
        
        if (state.searchQuery) {
            url = API_BASE + '/search?q=' + encodeURIComponent(state.searchQuery) + '&page=' + state.currentPage + '&language=' + tmdbLang;
        } else {
            if (state.currentGenre !== '0') {
                url += '&genre=' + state.currentGenre;
            }
            if (state.currentOrigin !== 'all') {
                url += '&origin=' + state.currentOrigin;
            }
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('>>> API Response - requested page:', state.currentPage, 'returned page:', data.page, 'total_pages:', data.total_pages, 'results count:', data.results?.length, 'first movie id:', data.results?.[0]?.id);
        
        if (data.results) {
            state.movies = data.results || [];
            state.totalPages = Math.min(data.total_pages || 1, 500);
            
            if (state.currentPage > 500) {
                state.currentPage = 500;
            }
            
            console.log('Before renderMovies');
            renderMovies();
            console.log('Before updateUI');
            updateUI();
            console.log('After updateUI');
        }
        
    } catch (error) {
        console.error('Erro:', error);
    }
    
    state.isLoading = false;
}

// Renderizar gêneros
function renderGenres() {
    const container = document.getElementById('genresList');
    if (!container) return;
    
    // Opção "Todos" primeiro
    let genresHtml = `
        <div class="genre-item ${state.currentGenre === '0' ? 'active' : ''}" 
             data-id="0">
            <i class="fas fa-globe"></i>
            <span>Todos</span>
        </div>
    `;
    
    genresHtml += state.genres.map(genre => `
        <div class="genre-item ${genre.id.toString() === state.currentGenre ? 'active' : ''}" 
             data-id="${genre.id}">
            <i class="${genre.icon || 'fas fa-film'}"></i>
            <span>${genre.name}</span>
        </div>
    `).join('');
    
    container.innerHTML = genresHtml;
    
    // Popula o select de gêneros no mobile
    const mobileSelect = document.getElementById('genreSelectMobile');
    if (mobileSelect) {
        let optionsHtml = '<option value="0">Todos os Generos</option>';
        optionsHtml += state.genres.map(genre => 
            `<option value="${genre.id}" ${genre.id.toString() === state.currentGenre ? 'selected' : ''}>${genre.name}</option>`
        ).join('');
        mobileSelect.innerHTML = optionsHtml;
    }
    
    container.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', function() {
            state.currentGenre = this.dataset.id;
            state.currentPage = 1;
            state.searchQuery = '';
            document.getElementById('searchInput').value = '';
            
            document.querySelectorAll('.genre-item').forEach(g => g.classList.remove('active'));
            this.classList.add('active');
            
            updateTitle();
            loadMovies();
        });
    });
}

// Renderizar filmes
function renderMovies() {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    
    if (state.movies.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum filme encontrado</p>';
        return;
    }
    
    container.innerHTML = state.movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
        const posterUrl = movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null;
        const isFav = favorites.includes(movie.id);
        const hasVotes = movie.vote_count > 0;
        
        return `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <div class="movie-poster">
                    ${posterUrl ? 
                        `<img src="${posterUrl}" alt="${movie.title}" loading="lazy">` :
                        `<div class="poster-fallback"><i class="fas fa-film"></i></div>`
                    }
                    ${hasVotes && rating ? `<div class="rating"><i class="fas fa-star"></i> ${rating}</div>` : ''}
                    <button class="fav-btn ${isFav ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavorite(${movie.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title || 'Sem titulo'}</h3>
                    <div class="movie-meta">
                        ${year ? `<span class="year">${year}</span>` : ''}
                        ${movie.production_countries?.[0]?.name ? 
                            `<span>${movie.production_countries[0].name}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar textos da interface
function updateTranslations() {
    console.log('>>> updateTranslations START <<<');
    try {
        const lang = state.currentLanguage;
        
        // Busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = t('searchPlaceholder');
        } else {
            console.log('searchInput is null');
        }
        
        // Filtros origem
        const filterOriginLabel = document.getElementById('filterOriginLabel');
        if (filterOriginLabel) {
            filterOriginLabel.textContent = (t('originLabel') || 'Filmes:');
        } else {
            console.log('filterOriginLabel is null');
        }
        
        const filterOriginSelect = document.getElementById('filterOriginSelect');
        if (filterOriginSelect && filterOriginSelect.options.length >= 3) {
            filterOriginSelect.options[0].text = t('all');
            filterOriginSelect.options[1].text = t('national');
            filterOriginSelect.options[2].text = t('international');
        } else {
            console.log('filterOriginSelect is null or no options');
        }
        
        // Filtros ordenação
        const filterSortLabel = document.getElementById('filterSortLabel');
        if (filterSortLabel) {
            filterSortLabel.textContent = t('sortBy') + ':';
        } else {
            console.log('filterSortLabel is null');
        }
        
        const filterSortSelect = document.getElementById('filterSortSelect');
        if (filterSortSelect && filterSortSelect.options.length >= 4) {
            filterSortSelect.options[0].text = t('popular');
            filterSortSelect.options[1].text = t('bestRated') || t('rating');
            filterSortSelect.options[2].text = t('worstRated') || 'Piores Avaliados';
            filterSortSelect.options[3].text = t('release');
        } else {
            console.log('filterSortSelect is null or no options');
        }
        
        // Generos sidebar
        const genresTitle = document.getElementById('genresTitle');
        if (genresTitle) {
            genresTitle.textContent = t('genres');
        } else {
            console.log('genresTitle is null');
        }
        
        // Paginação
        const prevText = document.getElementById('prevText');
        if (prevText) {
            prevText.textContent = t('prev');
        } else {
            console.log('prevText is null');
        }
        
        const nextText = document.getElementById('nextText');
        if (nextText) {
            nextText.textContent = t('next');
        } else {
            console.log('nextText is null');
        }
        
        // Botão login
        const loginBtn = document.getElementById('authBtn');
        if (loginBtn) {
            const span = loginBtn.querySelector('span');
            if (span) {
                if (currentUser) {
                    span.textContent = t('logout');
                } else {
                    span.textContent = t('login');
                }
            } else {
                console.log('loginBtn span is null');
            }
        } else {
            console.log('loginBtn is null');
        }
    } catch (e) {
        console.error('Error in updateTranslations:', e, 'Stack:', e.stack);
    }
}

// Atualizar UI
function updateUI() {
    try {
        const moviesCount = document.getElementById('moviesCount');
        if (moviesCount) moviesCount.textContent = state.movies.length + ' ' + t('movies');
        
        const prevPageBtn = document.getElementById('prevPage');
        if (prevPageBtn) prevPageBtn.disabled = state.currentPage <= 1;
        
        const nextPageBtn = document.getElementById('nextPage');
        if (nextPageBtn) nextPageBtn.disabled = state.currentPage >= state.totalPages;
        
        // Mostrar indicador de página
        const indicator = document.getElementById('pageIndicator');
        if (indicator) {
            indicator.textContent = state.currentPage + ' / ' + state.totalPages;
        }
        
        renderPageNumbers();
        updateTitle();
        updateTranslations();
        updateURL();
    } catch (e) {
        console.error('Error in updateUI:', e);
    }
}

function renderPageNumbers() {
    const container = document.getElementById('pageNumbers');
    if (!container) return;
    
    const total = state.totalPages;
    const current = state.currentPage;
    let html = '';
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }
    } else {
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) {
                html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            html += '<span>...</span>';
            html += `<button class="page-btn" onclick="goToPage(${total})">${total}</button>`;
        } else if (current >= total - 3) {
            html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
            html += '<span>...</span>';
            for (let i = total - 4; i <= total; i++) {
                html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
        } else {
            html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
            html += '<span>...</span>';
            for (let i = current - 1; i <= current + 1; i++) {
                html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            html += '<span>...</span>';
            html += `<button class="page-btn" onclick="goToPage(${total})">${total}</button>`;
        }
    }
    
    container.innerHTML = html;
}

window.goToPage = function(page) {
    console.log('goToPage called with:', page, 'current totalPages:', state.totalPages);
    if (page < 1 || page > state.totalPages) return;
    state.currentPage = page;
    console.log('Calling loadMovies with page:', state.currentPage);
    loadMovies();
};

function updateTitle() {
    try {
        const titleEl = document.getElementById('currentTitle');
        if (!titleEl) return;
        
        // Se tem busca, mostra o termo procurado
        if (state.searchQuery) {
            titleEl.textContent = 'Resultados para: ' + state.searchQuery;
            return;
        }
        
        const titles = {
            'pt-BR': { popularity: 'Filmes Populares', rating: 'Melhores Avaliados', worst: 'Piores Avaliados', release: 'Lançamentos' },
            'en': { popularity: 'Popular Movies', rating: 'Top Rated', worst: 'Lowest Rated', release: 'New Releases' },
            'es': { popularity: 'Peliculas Populares', rating: 'Mejor Valoradas', worst: 'Peor Valoradas', release: 'Estrenos' },
            'zh-CN': { popularity: '热门电影', rating: '评分最高', worst: '评分最低', release: '最新' },
            'zh-HK': { popularity: '熱門電影', rating: '評分最高', worst: '評分最低', release: '最新' },
            'ja': { popularity: '人気映画', rating: '高評価', worst: '低評価', release: '最新作' },
            'ru': { popularity: 'Популярные фильмы', rating: 'Лучшие оценки', worst: 'Худшие оценки', release: 'Новейшие' },
            'ko': { popularity: '인기 영화', rating: '높은 평점', worst: '낮은 평점', release: '최신' }
        };
        
        const langTitles = titles[state.currentLanguage] || titles['pt-BR'];
        const sortKey = state.currentSort.replace('_desc', '').replace('_asc', '');
        titleEl.textContent = langTitles[sortKey] || langTitles.popularity;
    } catch (e) {
        console.error('Error in updateTitle:', e);
    }
}

// Detalhes do filme
window.showMovieDetails = async function(movieId) {
    const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
    
    try {
        const response = await fetch(API_BASE + '/movie?id=' + movieId + '&language=' + tmdbLang);
        const data = await response.json();
        
        if (data.success && data.movie) {
            showMovieModal(data.movie);
        } else {
            // Fallback para dados locais
            const movie = state.movies.find(m => m.id === movieId);
            if (movie) showMovieModal(movie);
        }
    } catch (error) {
        console.error('Erro:', error);
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) showMovieModal(movie);
    }
};

function showMovieModal(movie) {
    const modal = document.getElementById('movieModal');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
    const posterUrl = movie.poster_path ? movie.poster_path : null;
    const isFav = favorites.includes(movie.id);
    const hasVotes = movie.vote_count > 0;
    
    // Plataformas de streaming
    let streamingHtml = '';
    if (movie.streaming && movie.streaming.length > 0) {
        const platformUrls = {
            'Netflix': 'https://www.netflix.com',
            'Amazon Prime Video': 'https://www.primevideo.com',
            'Disney+': 'https://www.disneyplus.com',
            'HBO Max': 'https://www.max.com',
            'HBO': 'https://www.hbomax.com',
            'Paramount+': 'https://www.paramountplus.com',
            'Apple TV+': 'https://tv.apple.com',
            'Google Play Movies': 'https://play.google.com/store/movies',
            'YouTube': 'https://www.youtube.com',
            'Spotify': 'https://www.spotify.com',
            'Crunchyroll': 'https://www.crunchyroll.com',
            'Globoplay': 'https://globoplay.globo.com',
            'Netflix': 'https://www.netflix.com',
            'Amazon Prime Video': 'https://www.primevideo.com',
            'Disney+': 'https://www.disneyplus.com'
        };
        
        streamingHtml = `
            <div class="modal-platforms">
                <h4><i class="fas fa-play"></i> Onde Assistir</h4>
                <div class="streaming-list">
                    ${movie.streaming.map(p => {
                        const url = platformUrls[p.name] || `https://www.${p.name.toLowerCase().replace(/\s+/g, '')}.com`;
                        return `<a href="${url}" 
                           target="_blank" 
                           class="stream-tag" 
                           title="Ir para ${p.name}">
                            <img src="${p.logo}" alt="${p.name}" onerror="this.style.display='none'">
                            <span>${p.name}</span>
                        </a>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Link para trailer no YouTube
    const trailerLink = movie.trailer || '';
    
    titleEl.textContent = movie.title;
    
    // Géneros
    let genresHtml = '';
    if (movie.genres && movie.genres.length > 0) {
        genresHtml = movie.genres.map(g => `<span>${g.name}</span>`).join('');
    }
    
    bodyEl.innerHTML = `
        <div class="modal-flex">
            <div class="modal-poster">
                ${posterUrl ? 
                    `<img src="${posterUrl}" alt="${movie.title}">` :
                    `<div class="poster-fallback"><i class="fas fa-film"></i></div>`
                }
            </div>
            <div class="modal-details">
                <h3>${movie.title}</h3>
                <div class="modal-tags">
                    ${hasVotes && rating ? `<span class="rating-tag"><i class="fas fa-star"></i> ${rating}/10</span>` : ''}
                    ${year ? `<span>${year}</span>` : ''}
                    ${movie.runtime ? `<span>${movie.runtime} min</span>` : ''}
                </div>
                <div class="modal-tags">
                    ${genresHtml}
                </div>
                ${streamingHtml}
                <p class="modal-desc">${movie.overview || 'Sinopse nao disponivel.'}</p>
                ${movie.original_title !== movie.title ? 
                    `<p><strong>Titulo original:</strong> ${movie.original_title}</p>` : ''}
                ${trailerLink ? `
                <a href="${trailerLink}" 
                   target="_blank" 
                   class="trailer-btn">
                    <i class="fab fa-youtube"></i>
                    <span>Ver Trailer</span>
                </a>` : ''}
                <button class="fav-btn-large ${isFav ? 'active' : ''}" 
                        onclick="toggleFavorite(${movie.id})">
                    <i class="fas fa-heart"></i>
                    <span>${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeMovieModal() {
    document.getElementById('movieModal').classList.remove('open');
    document.body.style.overflow = '';
}

// Login
function openLoginModal() {
    if (currentUser) {
        alert('Você está logado como: ' + currentUser.name);
    } else {
        showLoginForm();
        document.getElementById('loginModal').classList.add('open');
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('open');
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginModalTitle').textContent = 'Entrar';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginModalTitle').textContent = 'Cadastrar';
}

window.showRegister = function(e) {
    e.preventDefault();
    showRegisterForm();
};

window.showLogin = function(e) {
    e.preventDefault();
    showLoginForm();
};

function doRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !password) {
        alert('Preencha todos os campos!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (password.length < 4) {
        alert('A senha deve ter pelo menos 4 caracteres!');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        provider: 'local'
    };
    
    users.push(newUser);
    localStorage.setItem('cineworld_users', JSON.stringify(users));
    
    // Auto login
    doLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
    alert('Conta criada com sucesso! Bem-vindo, ' + name + '!');
}

function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Preencha email e senha!');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const loginUser = { id: user.id, name: user.name, email: user.email };
        currentUser = loginUser;
        localStorage.setItem('cineworld_user', JSON.stringify(loginUser));
        
        updateAuthUI();
        closeLoginModal();
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        alert('Bem-vindo de volta, ' + user.name + '!');
    } else {
        alert('Email ou senha incorretos!');
    }
}

window.logout = function() {
    currentUser = null;
    favorites = [];
    localStorage.removeItem('cineworld_user');
    localStorage.removeItem('cineworld_favorites');
    updateAuthUI();
    updateFavoritesCount();
};

function updateAuthUI() {
    const btn = document.getElementById('authBtn');
    const text = btn.querySelector('span') || document.getElementById('authText');
    
    if (currentUser) {
        btn.innerHTML = `<i class="fas fa-user-check"></i><span>Sair</span>`;
        btn.onclick = logout;
    } else {
        btn.innerHTML = `<i class="fas fa-user"></i><span>Entrar</span>`;
        btn.onclick = openLoginModal;
    }
}

// Favoritos
function toggleFavorite(movieId) {
    if (!currentUser) {
        alert('Por favor, entre na sua conta para adicionar favoritos!');
        openLoginModal();
        return;
    }
    
    const index = favorites.indexOf(movieId);
    
    if (index === -1) {
        favorites.push(movieId);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('cineworld_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    renderMovies();
    
    // Atualiza o modal se estiver aberto
    const modal = document.getElementById('movieModal');
    if (modal.classList.contains('open')) {
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) showMovieModal(movie);
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
        alert('Voce ainda nao tem filmes favoritos!');
        return;
    }
    
    const favMovies = state.movies.filter(m => favorites.includes(m.id));
    if (favMovies.length > 0) {
        state.movies = favMovies;
        renderMovies();
        document.getElementById('currentTitle').textContent = 'Meus Favoritos';
        document.getElementById('moviesCount').textContent = favMovies.length + ' filmes';
    }
}

// Auth
function initAuth() {
    const savedUser = localStorage.getItem('cineworld_user');
    const savedFavorites = localStorage.getItem('cineworld_favorites');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        updateFavoritesCount();
    }
}

// Contato
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
    
    const name = document.getElementById('contactName').value;
    const type = document.getElementById('contactType').value;
    const message = document.getElementById('contactMessage').value;
    
    // Google Forms URL
    const formUrl = 'https://forms.gle/aH6UcwjVitjkxzpV7';
    
    // Abre o Google Forms em nova aba
    window.open(formUrl, '_blank');
    
    alert('O formulario foi aberto! Por favor, preencha e envie.');
    
    // Limpa o formulario
    document.getElementById('contactForm').reset();
    closeContactModal();
}

window.submitContact = submitContact;
