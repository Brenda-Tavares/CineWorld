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
        popular: 'Populares', bestRated: 'Melhores Avaliados', worstRated: 'Piores Avaliados', release: 'Lancamentos', upcoming: 'Proximos Lancamentos',
        all: 'Todos', national: 'Nacionais', international: 'Internacionais', originLabel: 'Filmes:',
        genres: 'Generos', movies: 'filmes', page: 'Pagina', of: 'de',
        language: 'Idioma:',
        prev: 'Anterior', next: 'Proxima', details: 'Detalhes',
        rating: 'Avaliacao', year: 'Ano', synopsis: 'Sinopse',
        originalTitle: 'Titulo original', close: 'Fechar',
        noResults: 'Nenhum filme encontrado', tryAgain: 'Tente outro genero ou busca', resultsFor: 'Resultados para',
        login: 'Entrar', logout: 'Sair', loginTitle: 'Entrar',
        loginDesc: 'Escolha uma opcao para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Onde Assistir', runtime: 'min',
        favorites: 'Favoritos', noFavorites: 'Voce ainda nao tem favoritos!',
        welcome: 'Bem-vindo', sortBy: 'Ordenar',
        contact: 'Contato', contactTitle: 'Fale Conosco', contactDesc: 'Envie suas sugestoes, elogios ou reclamacoes',
        name: 'Nome (opcional)', type: 'Tipo', message: 'Mensagem *', send: 'Enviar',
        suggestion: 'Sugestao', compliment: 'Elogio', complaint: 'Reclamacao', other: 'Outro',
        footer: '© 2026 - Todos os direitos reservados | Desenvolvido por',
        tagline: 'Seu Guia de Filmes'
    },
    'en': {
        searchPlaceholder: 'Search movies...',
        popular: 'Popular', bestRated: 'Top Rated', worstRated: 'Lowest Rated', release: 'New Releases', upcoming: 'Upcoming Releases',
        all: 'All', national: 'National', international: 'International', originLabel: 'Movies:',
        genres: 'Genres', movies: 'movies', page: 'Page', of: 'of',
        language: 'Language:',
        prev: 'Previous', next: 'Next', details: 'Details',
        rating: 'Rating', year: 'Year', synopsis: 'Synopsis',
        originalTitle: 'Original title', close: 'Close',
        noResults: 'No movies found', tryAgain: 'Try another genre or search', resultsFor: 'Results for',
        login: 'Sign In', logout: 'Sign Out', loginTitle: 'Sign In',
        loginDesc: 'Choose an option to continue',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Watch On', runtime: 'min',
        favorites: 'Favorites', noFavorites: 'You have no favorites yet!',
        welcome: 'Welcome', sortBy: 'Sort',
        contact: 'Contact', contactTitle: 'Contact Us', contactDesc: 'Send your suggestions, compliments or complaints',
        name: 'Name (optional)', type: 'Type', message: 'Message *', send: 'Send',
        suggestion: 'Suggestion', compliment: 'Compliment', complaint: 'Complaint', other: 'Other',
        footer: '© 2026 - All rights reserved | Developed by',
        tagline: 'Your Movie Guide'
    },
    'es': {
        searchPlaceholder: 'Buscar películas...',
        popular: 'Películas Populares', bestRated: 'Mejor Valoradas', worstRated: 'Peor Valoradas', release: 'Estrenos', upcoming: 'Próximos Estrenos',
        all: 'Todos', national: 'Nacionales', international: 'Internacionales', originLabel: 'Películas:',
        genres: 'Géneros', movies: 'películas', page: 'Página', of: 'de',
        language: 'Idioma:',
        prev: 'Anterior', next: 'Siguiente', details: 'Detalles',
        rating: 'Valoración', year: 'Año', synopsis: 'Sinopsis',
        originalTitle: 'Título original', close: 'Cerrar',
        noResults: 'No se encontraron películas', tryAgain: 'Intenta otro género o búsqueda', resultsFor: 'Resultados para',
        login: 'Entrar', logout: 'Salir', loginTitle: 'Entrar',
        loginDesc: 'Elige una opción para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Ver en', runtime: 'min',
        favorites: 'Favoritos', noFavorites: '¡Aún no tienes favoritos!',
        welcome: 'Bienvenido', sortBy: 'Ordenar',
        contact: 'Contacto', contactTitle: 'Contáctanos', contactDesc: 'Envía tus sugerencias, elogios o quejas',
        name: 'Nombre (opcional)', type: 'Tipo', message: 'Mensaje *', send: 'Enviar',
        suggestion: 'Sugerencia', compliment: 'Elogio', complaint: 'Queja', other: 'Otro',
        footer: '© 2026 - Todos los derechos reservados | Desarrollado por',
        tagline: 'Tu Guía de Películas'
    },
    'zh-CN': {
        searchPlaceholder: '搜索电影...',
        popular: '热门电影', bestRated: '评分最高', worstRated: '评分最低', release: '最新', upcoming: '即将上映',
        all: '全部', national: '国产', international: '国际', originLabel: '电影:',
        genres: '类型', movies: '部电影', page: '第', of: '页，共',
        language: '语言:',
        prev: '上一页', next: '下一页', details: '详情',
        rating: '评分', year: '年份', synopsis: '简介',
        originalTitle: '原名', close: '关闭',
        noResults: '未找到电影', tryAgain: '尝试其他类型或搜索', resultsFor: '搜索结果',
        login: '登录', logout: '退出', loginTitle: '登录',
        loginDesc: '选择一个选项继续',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '在线观看', runtime: '分钟',
        favorites: '收藏', noFavorites: '还没有收藏！',
        welcome: '欢迎', sortBy: '排序',
        contact: '联系', contactTitle: '联系我们', contactDesc: '发送您的建议、表扬或投诉',
        name: '姓名（可选）', type: '类型', message: '留言 *', send: '发送',
        suggestion: '建议', compliment: '表扬', complaint: '投诉', other: '其他',
        footer: '© 2026 - 版权所有 | 开发',
        tagline: '您的电影指南'
    },
    'zh-HK': {
        searchPlaceholder: '搜尋電影...',
        popular: '熱門電影', bestRated: '評分最高', worstRated: '評分最低', release: '最新', upcoming: '即將上映',
        all: '全部', national: '本土', international: '國際', originLabel: '電影:',
        genres: '類型', movies: '部電影', page: '第', of: '頁，共',
        language: '語言:',
        prev: '上一頁', next: '下一頁', details: '詳情',
        rating: '評分', year: '年份', synopsis: '簡介',
        originalTitle: '原名', close: '關閉',
        noResults: '未找到電影', tryAgain: '嘗試其他類型或搜尋', resultsFor: '搜尋結果',
        login: '登入', logout: '登出', loginTitle: '登入',
        loginDesc: '選擇一個選項繼續',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '線上觀看', runtime: '分鐘',
        favorites: '收藏', noFavorites: '還沒有收藏！',
        welcome: '歡迎', sortBy: '排序',
        contact: '聯繫', contactTitle: '聯繫我們', contactDesc: '發送您的建議、表揚或投訴',
        name: '姓名可選', type: '類型', message: '訊息 *', send: '發送',
        suggestion: '建議', compliment: '表揚', complaint: '投訴', other: '其他',
        footer: '© 2026 - 版權所有 | 開發',
        tagline: '您的電影指南'
    },
    'ja': {
        searchPlaceholder: '映画を検索...',
        popular: '人気映画', bestRated: '高評価', worstRated: '低評価', release: '最新作', upcoming: '公開予定',
        all: 'すべて', national: '日本', international: '外国', originLabel: '映画:',
        genres: 'ジャンル', movies: '映画', page: 'ページ', of: '/',
        language: '言語:',
        prev: '前へ', next: '次へ', details: '詳細',
        rating: '評価', year: '年', synopsis: 'あらすじ',
        originalTitle: '原題', close: '閉じる',
        noResults: '映画が見つかりません', tryAgain: '他のジャンルで検索', resultsFor: '検索結果',
        login: 'ログイン', logout: 'ログアウト', loginTitle: 'ログイン',
        loginDesc: 'オプションを選択してください',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '視聴', runtime: '分',
        favorites: 'お気に入り', noFavorites: 'お気に入りはまだありません！',
        welcome: 'ようこそ', sortBy: '並べ替え',
        contact: 'お問い合わせ', contactTitle: 'お問い合わせ', contactDesc: 'ご要望やお問い合わせを送信',
        name: '名前任意', type: 'タイプ', message: 'メッセージ *', send: '送信',
        suggestion: 'ご要望', compliment: 'お問い合わせ', complaint: '苦情', other: 'その他',
        footer: '© 2026 - 全著作権 | 開発',
        tagline: 'あなたの映画ガイド'
    },
    'ru': {
        searchPlaceholder: 'Поиск фильмов...',
        popular: 'Популярные фильмы', bestRated: 'Лучшие оценки', worstRated: 'Худшие оценки', release: 'Новейшие', upcoming: 'Скоро в прокате',
        all: 'Все', national: 'Национальные', international: 'Международные', originLabel: 'Фильмы:',
        genres: 'Жанры', movies: 'фильмов', page: 'Страница', of: 'из',
        language: 'Язык:',
        prev: 'Предыдущая', next: 'Следующая', details: 'Детали',
        rating: 'Рейтинг', year: 'Год', synopsis: 'Описание',
        originalTitle: 'Оригинальное название', close: 'Закрыть',
        noResults: 'Фильмы не найдены', tryAgain: 'Попробуйте другой жанр или поиск', resultsFor: 'Результаты для',
        login: 'Войти', logout: 'Выйти', loginTitle: 'Войти',
        loginDesc: 'Выберите вариант',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Смотреть', runtime: 'мин',
        favorites: 'Избранное', noFavorites: 'У вас пока нет избранного!',
        welcome: 'Добро пожаловать', sortBy: 'Сортировать',
        contact: 'Контакт', contactTitle: 'Связаться', contactDesc: 'Отправьте ваши предложения, похвалу или жалобы',
        name: 'Имя необязательно', type: 'Тип', message: 'Сообщение *', send: 'Отправить',
        suggestion: 'Предложение', compliment: 'Похвала', complaint: 'Жалоба', other: 'Другое',
        footer: '© 2026 - Все права защищены | Разработано',
        tagline: 'Ваш гид по фильмам'
    },
    'ko': {
        searchPlaceholder: '영화 검색...',
        popular: '인기 영화', bestRated: '높은 평점', worstRated: '낮은 평점', release: '최신', upcoming: '개봉 예정',
        all: '전체', national: '국내', international: '해외', originLabel: '영화:',
        genres: '장르', movies: '편', page: '페이지', of: '/',
        language: '언어:',
        prev: '이전', next: '다음', details: '상세정보',
        rating: '평점', year: '연도', synopsis: '시놉시스',
        originalTitle: '원제', close: '닫기',
        noResults: '영화를 찾을 수 없습니다', tryAgain: '다른 장르 또는 검색을 시도하세요', resultsFor: '검색 결과',
        login: '로그인', logout: '로그아웃', loginTitle: '로그인',
        loginDesc: '옵션을 선택하세요',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '시청', runtime: '분',
        favorites: '즐겨찾기', noFavorites: '즐겨찾기가 아직 없습니다!',
        welcome: '환영합니다', sortBy: '정렬',
        contact: '연락', contactTitle: '연락하기', contactDesc: '제안, 칭찬 또는 불만의 보내기',
        name: '이름 선택', type: '유형', message: '메시지 *', send: '보내기',
        suggestion: '제안', compliment: '칭찬', complaint: '불만', other: '기타',
        footer: '© 2026 - 모든 권리 보유 | 개발',
        tagline: '나의 영화 가이드'
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
    currentYear: '',
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
    loadTheme();
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
    if (params.has('year')) {
        state.currentYear = params.get('year');
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
    
    const yearSelect = document.getElementById('filterYearSelect');
    if (yearSelect) yearSelect.value = state.currentYear;
    
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
    if (state.currentYear) params.set('year', state.currentYear);
    
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
        
        const langLabel = document.getElementById('langLabel');
        if (langLabel) {
            langLabel.textContent = t('language') || 'Idioma:';
        }
        
        updateURL();
        window.location.href = window.location.pathname + '?lang=' + state.currentLanguage;
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
    
    // Filtro de ano
    const yearSelect = document.getElementById('filterYearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            state.currentYear = this.value;
            state.currentPage = 1;
            loadMovies();
        });
    }
    
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
            const aiPanel = document.getElementById('aiPanel');
            if (aiPanel.classList.contains('open')) {
                aiPanel.classList.remove('open');
            }
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
        const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
        let url = API_BASE + '/movies?page=' + state.currentPage + '&sort=' + state.currentSort + '&language=' + tmdbLang;
        
        if (state.searchQuery) {
            url = API_BASE + '/movies?q=' + encodeURIComponent(state.searchQuery) + '&page=' + state.currentPage + '&language=' + tmdbLang;
        } else {
            if (state.currentGenre !== '0') {
                url += '&genre=' + state.currentGenre;
            }
            if (state.currentOrigin !== 'all') {
                url += '&origin=' + state.currentOrigin;
            }
            if (state.currentYear) {
                url += '&year=' + state.currentYear;
            }
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results) {
            state.movies = data.results || [];
            state.totalPages = Math.min(data.total_pages || 1, 500);
            
            if (state.currentPage > 500) {
                state.currentPage = 500;
            }
            
            renderMovies();
            updateUI();
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
        const posterUrl = movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : TMDB_IMAGE_BASE + movie.poster_path) : null;
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
    try {
        const lang = state.currentLanguage;
        
        const siteTagline = document.getElementById('siteTagline');
        if (siteTagline) siteTagline.textContent = t('tagline');
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.placeholder = t('searchPlaceholder');
        
        const filterOriginLabel = document.getElementById('filterOriginLabel');
        if (filterOriginLabel) filterOriginLabel.textContent = (t('originLabel') || 'Filmes:');
        
        const filterOriginSelect = document.getElementById('filterOriginSelect');
        if (filterOriginSelect && filterOriginSelect.options.length >= 3) {
            filterOriginSelect.options[0].text = t('all');
            filterOriginSelect.options[1].text = t('national');
            filterOriginSelect.options[2].text = t('international');
        }
        
        const filterSortLabel = document.getElementById('filterSortLabel');
        if (filterSortLabel) filterSortLabel.textContent = t('sortBy') + ':';
        
        const filterSortSelect = document.getElementById('filterSortSelect');
        if (filterSortSelect && filterSortSelect.options.length >= 4) {
            filterSortSelect.options[0].text = t('popular');
            filterSortSelect.options[1].text = t('bestRated') || t('rating');
            filterSortSelect.options[2].text = t('worstRated') || 'Piores Avaliados';
            filterSortSelect.options[3].text = t('release');
        }
        
        const genresTitle = document.getElementById('genresTitle');
        if (genresTitle) genresTitle.textContent = t('genres');
        
        const prevText = document.getElementById('prevText');
        if (prevText) prevText.textContent = t('prev');
        const nextText = document.getElementById('nextText');
        if (nextText) nextText.textContent = t('next');
        
        const loginBtn = document.getElementById('authBtn');
        if (loginBtn) {
            const span = loginBtn.querySelector('span');
            if (span) {
                if (currentUser) {
                    span.textContent = t('logout');
                } else {
                    span.textContent = t('login');
                }
            }
        }
    } catch (e) {
        console.error('Error in updateTranslations:', e);
    }
}

// Atualizar footer
function updateFooter() {
    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.innerHTML = `<p>${t('footer')} <strong>Alabaster Developer</strong></p>`;
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
        
        const indicator = document.getElementById('pageIndicator');
        if (indicator) {
            indicator.textContent = state.currentPage + ' / ' + state.totalPages;
        }
        
        renderPageNumbers();
        updateTitle();
        updateTranslations();
        updateFooter();
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
    if (page < 1 || page > state.totalPages) return;
    state.currentPage = page;
    loadMovies();
};

function updateTitle() {
    try {
        const titleEl = document.getElementById('currentTitle');
        if (!titleEl) return;
        
        if (state.searchQuery) {
            titleEl.textContent = t('resultsFor') + ': ' + state.searchQuery;
            return;
        }
        
        const titles = {
            'pt-BR': { popularity: 'Filmes Populares', rating: 'Melhores Avaliados', worst: 'Piores Avaliados', release: 'Lançamentos', upcoming: 'Próximos Lançamentos' },
            'en': { popularity: 'Popular Movies', rating: 'Top Rated', worst: 'Lowest Rated', release: 'New Releases', upcoming: 'Upcoming Releases' },
            'es': { popularity: 'Películas Populares', rating: 'Mejor Valoradas', worst: 'Peor Valoradas', release: 'Estrenos', upcoming: 'Próximos Estrenos' },
            'zh-CN': { popularity: '热门电影', rating: '评分最高', worst: '评分最低', release: '最新', upcoming: '即将上映' },
            'zh-HK': { popularity: '熱門電影', rating: '評分最高', worst: '評分最低', release: '最新', upcoming: '即將上映' },
            'ja': { popularity: '人気映画', rating: '高評価', worst: '低評価', release: '最新作', upcoming: '公開予定' },
            'ru': { popularity: 'Популярные фильмы', rating: 'Лучшие оценки', worst: 'Худшие оценки', release: 'Новейшие', upcoming: 'Скоро в прокате' },
            'ko': { popularity: '인기 영화', rating: '높은 평점', worst: '낮은 평점', release: '최신', upcoming: '개봉 예정' }
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
    
    let streamingHtml = '';
    if (movie.streaming && movie.streaming.length > 0) {
        const platformUrls = {
            'Netflix': 'https://www.netflix.com/search?',
            'Amazon Prime Video': 'https://www.primevideo.com/search/?phrase=',
            'Disney+': 'https://www.disneyplus.com/search?query=',
            'HBO Max': 'https://www.max.com/search?query=',
            'HBO': 'https://www.hbomax.com/search?query=',
            'Paramount+': 'https://www.paramountplus.com/search/',
            'Apple TV+': 'https://tv.apple.com/search?term=',
            'Google Play Movies': 'https://play.google.com/store/movies/search?query=',
            'YouTube': 'https://www.youtube.com/results?search_query=',
            'Crunchyroll': 'https://www.crunchyroll.com/search?q=',
            'Globoplay': 'https://globoplay.globo.com/busca/?query=',
            'Claro tv+': 'https://www.claro.com.br/tvplus/busca?termo=',
            'Oldflix': 'https://oldflix.com/search?query=',
            'Netflix Standard with Ads': 'https://www.netflix.com/search?'
        };
        
        const getPlatformUrl = (platformName, movieTitle) => {
            const baseUrl = platformUrls[platformName];
            if (!baseUrl) return null;
            return baseUrl + encodeURIComponent(movieTitle);
        };
        
        const flatrate = movie.streaming.filter(p => p.type === 'flatrate' && !p.isFree);
        const flatrateFree = movie.streaming.filter(p => p.type === 'flatrate' && p.isFree);
        const rent = movie.streaming.filter(p => p.type === 'rent');
        const buy = movie.streaming.filter(p => p.type === 'buy');
        const freeAlt = movie.streaming.filter(p => p.type === 'free-alt');
        
        let html = '<div class="modal-platforms">';
        
        if (flatrate.length > 0 || flatrateFree.length > 0 || freeAlt.length > 0) {
            html += '<h4><i class="fas fa-play"></i> Assistir</h4>';
            html += '<div class="streaming-list">';
            
            if (freeAlt.length > 0) {
                html += freeAlt.map(p => {
                    const url = p.link;
                    return `<a href="${url}" target="_blank" class="stream-tag stream-free stream-free-alt" title="${p.name} - Opção Gratuita">
                        <i class="fas fa-play"></i>
                        <span>${p.name}</span>
                    </a>`;
                }).join('');
            }
            
            if (flatrateFree.length > 0) {
                html += flatrateFree.map(p => {
                    const url = getPlatformUrl(p.name, movie.title) || p.link;
                    return `<a href="${url}" target="_blank" class="stream-tag stream-free" title="${p.name} (Gratuito)">
                        <span>${p.name}</span>
                        <i class="fas fa-tag" title="Gratuito"></i>
                    </a>`;
                }).join('');
            }
            
            if (flatrate.length > 0) {
                html += flatrate.map(p => {
                    const url = getPlatformUrl(p.name, movie.title) || p.link;
                    return `<a href="${url}" target="_blank" class="stream-tag" title="${p.name}">
                        <span>${p.name}</span>
                    </a>`;
                }).join('');
            }
            
            html += '</div>';
        }
        
        if (rent.length > 0) {
            html += '<h4><i class="fas fa-shopping-cart"></i> Alugar</h4>';
            html += '<div class="streaming-list">';
            html += rent.map(p => {
                const url = getPlatformUrl(p.name, movie.title) || p.link;
                return `<a href="${url}" target="_blank" class="stream-tag stream-rent" title="Alugar em ${p.name}">
                    <span>${p.name}</span>
                </a>`;
            }).join('');
            html += '</div>';
        }
        
        if (buy.length > 0) {
            html += '<h4><i class="fas fa-shopping-bag"></i> Comprar</h4>';
            html += '<div class="streaming-list">';
            html += buy.map(p => {
                const url = getPlatformUrl(p.name, movie.title) || p.link;
                return `<a href="${url}" target="_blank" class="stream-tag stream-buy" title="Comprar em ${p.name}">
                    <span>${p.name}</span>
                </a>`;
            }).join('');
            html += '</div>';
        }
        
        html += '</div>';
        streamingHtml = html;
    }
    
    const trailerLink = movie.trailer || '';
    
    titleEl.textContent = movie.title;
    
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

function toggleNavMenu() {
    document.getElementById('navMenu').classList.toggle('open');
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
    
    const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }
    
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        provider: 'local'
    };
    
    users.push(newUser);
    localStorage.setItem('cineworld_users', JSON.stringify(users));
    
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
    
    const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const loginUser = { id: user.id, name: user.name, email: user.email };
        currentUser = loginUser;
        localStorage.setItem('cineworld_user', JSON.stringify(loginUser));
        
        updateAuthUI();
        closeLoginModal();
        
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

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.setAttribute('data-theme', 'light');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
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
    
    const formUrl = 'https://forms.gle/aH6UcwjVitjkxzpV7';
    
    window.open(formUrl, '_blank');
    
    alert('O formulario foi aberto! Por favor, preencha e envie.');
    
    document.getElementById('contactForm').reset();
    closeContactModal();
}

window.submitContact = submitContact;

// AI Chat - Painel flutuante
function toggleAIPanel() {
    const panel = document.getElementById('aiPanel');
    panel.classList.toggle('open');
}

window.toggleAIPanel = toggleAIPanel;

async function askAI() {
    const input = document.getElementById('aiSearchInput');
    const query = input.value.trim();
    if (!query) return;
    
    // Close AI panel
    const panel = document.getElementById('aiPanel');
    panel.classList.remove('open');
    
    // Show loading
    document.getElementById('moviesGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> <span>IA analisando sua busca...</span></div>';
    
    // Set search
    state.searchQuery = query;
    state.currentPage = 1;
    state.currentGenre = '0';
    
    // Update URL
    const params = new URLSearchParams();
    params.set('q', query);
    window.history.pushState({}, '', '?' + params.toString());
    
    // Update title
    document.getElementById('currentTitle').textContent = t('resultsFor') + ': ' + query;
    
    // Load movies using AI search
    const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const url = API_BASE + '/ai-search?q=' + encodeURIComponent(query) + '&page=1&language=' + tmdbLang;
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages || 1, 500);
            renderMovies();
            updateUI();
        } else if (data.error) {
            document.getElementById('moviesGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-exclamation-triangle"></i> <span>Erro: ' + data.error + '</span></div>';
        } else {
            await loadMovies();
        }
} catch (error) {
        console.error('AI search error:', error);
        document.getElementById('moviesGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-exclamation-triangle"></i> <span>Erro na busca: ' + error.message + '</span></div>';
        await loadMovies();
    }

window.askAI = askAI;