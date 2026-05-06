// Supabase Configuration - CineWorld

// Toast notification function
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// CineWorld - Main Script
let state = {
    movies: [],
    currentPage: 1,
    totalPages: 1,
    currentGenre: '0',
    currentSort: 'popularity',
    currentOrigin: 'all',
    currentLanguage: 'pt-BR',
    currentYear: '',
    searchQuery: '',
    isLoading: false
};

let currentUser = null;
let favorites = [];

// Language map for TMDB API
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

// Translations
const translations = {
    'pt-BR': {
        searchPlaceholder: 'Buscar filmes...',
        popular: 'Populares', bestRated: 'Melhores Avaliados', worstRated: 'Piores Avaliados', release: 'Lançamentos', upcoming: 'Próximos Lançamentos',
        all: 'Todos', national: 'Nacionais', international: 'Internacionais', originLabel: 'Filmes:',
        allYears: 'Todos', genres: 'Gêneros', movies: 'filmes', page: 'Página', of: 'de',
        language: 'Idioma',
        prev: 'Anterior', next: 'Próxima', details: 'Detalhes',
        rating: 'Avaliação', year: 'Ano', synopsis: 'Sinopse', synopsisNotAvailable: 'Sinopse não disponível.',
        originalTitle: 'Título original', close: 'Fechar',
        noResults: 'Nenhum filme encontrado', tryAgain: 'Tente outro gênero ou busca', resultsFor: 'Resultados para',
        login: 'Entrar', logout: 'Sair', loginTitle: 'Entrar', registerTitle: 'Cadastrar', logoutMessage: 'Volte logo!',
        loginDesc: 'Escolha uma opção para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Onde Assistir', runtime: 'min',
        favorites: 'Favoritos', noFavorites: 'Você ainda não tem favoritos!',
        welcome: 'Bem-vindo', sortBy: 'Ordenar',
        contact: 'Contato', contactTitle: 'Fale Conosco', contactDesc: 'Envie suas sugestões, elogios ou reclamações',
        name: 'Nome (opcional)', type: 'Tipo', message: 'Mensagem *', send: 'Enviar',
        suggestion: 'Sugestão', compliment: 'Elogio', complaint: 'Reclamação', other: 'Outro',
        footer: '© 2026 - Todos os direitos reservados | Desenvolvido por',
        tagline: 'Descubra filmes e onde assistir',
        about: 'Sobre', privacy: 'Privacidade', terms: 'Termos', cookies: 'Cookies',
        watch: 'Assistir', rent: 'Alugar', buy: 'Comprar',
        navHome: 'Início', navAbout: 'Sobre', navPrivacy: 'Privacidade', navTerms: 'Termos', navCookies: 'Cookies',
        footerAbout: 'Sobre', footerPrivacy: 'Privacidade', footerTerms: 'Termos', footerCookies: 'Cookies',
        addToFavorites: 'Adicionar aos favoritos', removeFromFavorites: 'Remover dos favoritos', watchTrailer: 'Ver Trailer',
        aiTitle: 'O que deseja assistir?', aiGreeting: 'Olá! Sou a assistente de filmes do CineWorld.', aiDescribe: 'Descreva o que você quer assistir:', aiExample: 'Ex: "filme de ação com robôs", "comédia romântica indiana"', aiPlaceholder: 'Descreva o filme...',
        noTitle: 'Sem título',
        emailPlaceholder: 'Email', passwordPlaceholder: 'Senha', registerLink: 'Cadastre-se', login: 'Entrar', 
        invalidCredentials: 'Email ou senha incorretos!', fillEmailPassword: 'Preencha email e senha!', 
        passwordMismatch: 'As senhas não coincidem!', passwordLength: 'A senha deve ter pelo menos 4 caracteres!',
        profile: 'Perfil', changePassword: 'Alterar Senha',
        namePlaceholder: 'Nome', noAccount: 'Não tem conta?', hasAccount: 'Já tem conta', login: 'Entrar', confirmPasswordPlaceholder: 'Confirmar Senha', createAccount: 'Crie sua conta',
        contactSuccess: 'Formulário enviado com sucesso!', contactError: 'Erro ao enviar. Tente novamente.', contactOpenForm: 'O formulário foi aberto! Por favor, preencha e envie.',
        loginFirst: 'Por favor, entre na sua conta para adicionar favoritos!',
        myFavorites: 'Meus Favoritos'
    },
    'en': {
        searchPlaceholder: 'Search movies...',
        popular: 'Popular', bestRated: 'Top Rated', worstRated: 'Lowest Rated', release: 'New Releases', upcoming: 'Upcoming Releases',
        all: 'All', allYears: 'All', national: 'National', international: 'International', originLabel: 'Movies:',
        genres: 'Genres', movies: 'movies', page: 'Page', of: 'of',
        language: 'Language',
        prev: 'Previous', next: 'Next', details: 'Details',
        rating: 'Rating', year: 'Year', synopsis: 'Synopsis', synopsisNotAvailable: 'Synopsis not available',
        originalTitle: 'Original title', close: 'Close',
        noResults: 'No movies found', tryAgain: 'Try another genre or search', resultsFor: 'Results for',
        login: 'Sign In', logout: 'Sign Out', loginTitle: 'Sign In', registerTitle: 'Sign Up', logoutMessage: 'Come back soon!',
        loginDesc: 'Choose an option to continue',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Watch On', runtime: 'min',
        favorites: 'Favorites', noFavorites: 'You have no favorites yet!',
        welcome: 'Welcome', sortBy: 'Sort',
        contact: 'Contact', contactTitle: 'Contact Us', contactDesc: 'Send your suggestions, compliments or complaints',
        name: 'Name (optional)', type: 'Type', message: 'Message *', send: 'Send',
        suggestion: 'Suggestion', compliment: 'Compliment', complaint: 'Complaint', other: 'Other',
        footer: '© 2026 - All rights reserved | Developed by',
        tagline: 'Discover movies and where to watch',
        about: 'About', privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
        watch: 'Watch', rent: 'Rent', buy: 'Buy',
        navHome: 'Home', navAbout: 'About', navPrivacy: 'Privacy', navTerms: 'Terms', navCookies: 'Cookies',
        footerAbout: 'About', footerPrivacy: 'Privacy', footerTerms: 'Terms', footerCookies: 'Cookies',
        addToFavorites: 'Add to favorites', removeFromFavorites: 'Remove from favorites', watchTrailer: 'Watch Trailer',
        aiTitle: 'What would you like to watch?', aiGreeting: 'Hello! I am the CineWorld movie assistant.', aiDescribe: 'Describe what you want to watch:', aiExample: 'Ex: "action movie with robots", "Indian romantic comedy"', aiPlaceholder: 'Describe the movie...',
        noTitle: 'No Title',
        emailPlaceholder: 'Email', passwordPlaceholder: 'Password', registerLink: 'Sign up', login: 'Sign In',
        invalidCredentials: 'Email or password incorrect!', fillEmailPassword: 'Fill in email and password!', passwordMismatch: 'Passwords do not match!', passwordLength: 'Password must be at least 4 characters!',
        namePlaceholder: 'Name', noAccount: 'No account?', hasAccount: 'Already have account', login: 'Sign In',
        confirmPasswordPlaceholder: 'Confirm Password', createAccount: 'Create your account',
        contactSuccess: 'Form submitted successfully!', contactError: 'Error submitting. Try again.', contactOpenForm: 'The form has been opened! Please fill and send.',
        loginFirst: 'Please login to add favorites!',
        myFavorites: 'My Favorites',
        profile: 'Profile', changePassword: 'Change Password'
    },
    'es': {
        searchPlaceholder: 'Buscar películas...',
        popular: 'Películas Populares', bestRated: 'Mejor Valoradas', worstRated: 'Peor Valoradas', release: 'Estrenos', upcoming: 'Próximos Estrenos',
        all: 'Todos', allYears: 'Todos', national: 'Nacionales', international: 'Internacionales', originLabel: 'Películas:',
        genres: 'Géneros', movies: 'películas', page: 'Página', of: 'de',
        language: 'Idioma',
        prev: 'Anterior', next: 'Siguiente', details: 'Detalles',
        rating: 'Valoración', year: 'Año', synopsis: 'Sinopsis', synopsisNotAvailable: 'Sinopsis no disponible.',
        originalTitle: 'Título original', close: 'Cerrar',
        noResults: 'No se encontraron películas', tryAgain: 'Intenta otro género o búsqueda', resultsFor: 'Resultados para',
        login: 'Entrar', logout: 'Salir', loginTitle: 'Entrar', registerTitle: 'Registrarse', logoutMessage: '¡Vuelve pronto!',
        loginDesc: 'Elige una opción para continuar',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Ver en', runtime: 'min',
        favorites: 'Favoritos', noFavorites: '¡Aún no tienes favoritos!',
        welcome: 'Bienvenido', sortBy: 'Ordenar',
        contact: 'Contacto', contactTitle: 'Contáctanos', contactDesc: 'Envía tus sugerencias, elogios o quejas',
        name: 'Nombre (opcional)', type: 'Tipo', message: 'Mensaje *', send: 'Enviar',
        suggestion: 'Sugerencia', compliment: 'Elogio', complaint: 'Queja', other: 'Otro',
        footer: '© 2026 - Todos los derechos reservados | Desarrollado por',
        tagline: 'Descubre películas y dónde verlas',
        about: 'Sobre', privacy: 'Privacidad', terms: 'Términos', cookies: 'Cookies',
        watch: 'Ver', rent: 'Alquilar', buy: 'Comprar',
        navHome: 'Inicio', navAbout: 'Acerca de', navPrivacy: 'Privacidad', navTerms: 'Términos', navCookies: 'Cookies',
        footerAbout: 'Acerca de', footerPrivacy: 'Privacidad', footerTerms: 'Términos', footerCookies: 'Cookies',
        addToFavorites: 'Agregar a favoritos', removeFromFavorites: 'Quitar de favoritos', watchTrailer: 'Ver Trailer',
        aiTitle: '¿Qué quieres ver?', aiGreeting: '¡Hola! Soy el asistente de películas de CineWorld.', aiDescribe: 'Describe lo que quieres ver:', aiExample: 'Ej: "película de acción con robots"', aiPlaceholder: 'Describe la película...',
        noTitle: 'Sin título',
        emailPlaceholder: 'Correo electrónico', passwordPlaceholder: 'Contraseña', registerLink: 'Regístrate', login: 'Entrar',
        invalidCredentials: '¡Email o contraseña incorrectos!', fillEmailPassword: '¡Completa email y contraseña!', passwordMismatch: '¡Las contraseñas no coinciden!', passwordLength: '¡La contraseña debe tener al menos 4 caracteres!',
        namePlaceholder: 'Nombre', noAccount: '¿No tienes cuenta?', hasAccount: 'Ya tengo cuenta', login: 'Entrar',
        confirmPasswordPlaceholder: 'Confirmar Contraseña', createAccount: 'Crea tu cuenta',
        contactSuccess: '¡Formulario enviado con éxito!', contactError: 'Error al enviar. Inténtalo de nuevo.', contactOpenForm: '¡El formulario se ha abierto! Por favor, llena y envía.',
        loginFirst: '¡Por favor, entra en tu cuenta para agregar favoritos!',
        myFavorites: 'Mis Favoritos',
        profile: 'Perfil', changePassword: 'Cambiar Contraseña'
    },
    'zh-CN': {
        searchPlaceholder: '搜索电影...',
        popular: '热门电影', bestRated: '评分最高', worstRated: '评分最低', release: '最新', upcoming: '即将上映',
        all: '全部', allYears: '全部', national: '国产', international: '国际', originLabel: '电影:',
        genres: '类型', movies: '部电影', page: '第', of: '页，共',
        language: '语言',
        prev: '上一页', next: '下一页', details: '详情',
        rating: '评分', year: '年份', synopsis: '简介', synopsisNotAvailable: '简介不可用',
        originalTitle: '原名', close: '关闭',
        noResults: '未找到电影', tryAgain: '尝试其他类型或搜索', resultsFor: '搜索结果',
        login: '登录', logout: '登出', loginTitle: '登录', registerTitle: '注册', logoutMessage: '欢迎下次光临！',
        loginDesc: '选择一个选项继续',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '在线观看', runtime: '分钟',
        favorites: '收藏', noFavorites: '还没有收藏！',
        welcome: '欢迎', sortBy: '排序',
        contact: '联系', contactTitle: '联系我们', contactDesc: '发送您的建议、表扬或投诉',
        name: '姓名（可选）', type: '类型', message: '留言 *', send: '发送',
        suggestion: '建议', compliment: '表扬', complaint: '投诉', other: '其他',
        footer: '© 2026 - 版权所有 | 开发',
        tagline: '发现电影和在哪里观看',
        about: '关于', privacy: '隐私', terms: '条款', cookies: 'Cookies',
        watch: '观看', rent: '租借', buy: '购买',
        navHome: '首页', navAbout: '关于', navPrivacy: '隐私', navTerms: '条款', navCookies: 'Cookies',
        footerAbout: '关于', footerPrivacy: '隐私', footerTerms: '条款', footerCookies: 'Cookies',
        addToFavorites: '添加到收藏', removeFromFavorites: '从收藏中删除', watchTrailer: '观看预告片',
        aiTitle: '想看什么?', aiGreeting: '你好！我是 CineWorld 电影助手。', aiDescribe: '描述你想看什么:', aiExample: '例如："机器人动作片"', aiPlaceholder: '描述电影...',
        noTitle: '无标题',
        emailPlaceholder: '邮箱', passwordPlaceholder: '密码', registerLink: '注册', login: '登录',
        invalidCredentials: '邮箱或密码错误！', fillEmailPassword: '请填写邮箱和密码！', passwordMismatch: '密码不匹配！', passwordLength: '密码必须至少4个字符！',
        namePlaceholder: '姓名', noAccount: '没有账户？', hasAccount: '已有账户', login: '登录',
        confirmPasswordPlaceholder: '确认密码', createAccount: '创建账户',
        contactSuccess: '表单提交成功！', contactError: '提交错误，请重试。', contactOpenForm: '表单已打开！请填写并发送。',
        loginFirst: '请登录以添加收藏！',
        myFavorites: '我的收藏',
        profile: '个人资料', changePassword: '修改密码'
    },
    'zh-HK': {
        searchPlaceholder: '搜尋電影...',
        popular: '熱門電影', bestRated: '評分最高', worstRated: '評分最低', release: '最新', upcoming: '即將上映',
        all: '全部', allYears: '全部', national: '本土', international: '國際', originLabel: '電影:',
        genres: '類型', movies: '部電影', page: '第', of: '頁，共',
        language: '語言',
        prev: '上一頁', next: '下一頁', details: '詳情',
        rating: '評分', year: '年份', synopsis: '簡介', synopsisNotAvailable: '簡介不可用',
        originalTitle: '原名', close: '關閉',
        noResults: '未找到電影', tryAgain: '嘗試其他類型或搜尋', resultsFor: '搜尋結果',
        login: '登入', logout: '登出', loginTitle: '登入', registerTitle: '註冊', logoutMessage: '歡迎下次光臨！',
        loginDesc: '選擇一個選項繼續',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '線上觀看', runtime: '分鐘',
        favorites: '收藏', noFavorites: '還沒有收藏！',
        welcome: '歡迎', sortBy: '排序',
        contact: '聯繫', contactTitle: '聯繫我們', contactDesc: '發送您的建議、表揚或投訴',
        name: '姓名可選', type: '類型', message: '訊息 *', send: '發送',
        suggestion: '建議', compliment: '表揚', complaint: '投訴', other: '其他',
        footer: '© 2026 - 版權所有 | 開發',
        tagline: '發現電影和在哪裡觀看',
        about: '關於', privacy: '隱私', terms: '條款', cookies: 'Cookies',
        watch: '觀看', rent: '租用', buy: '購買',
        navHome: '首頁', navAbout: '關於', navPrivacy: '隱私', navTerms: '條款', navCookies: 'Cookies',
        footerAbout: '關於', footerPrivacy: '隱私', footerTerms: '條款', footerCookies: 'Cookies',
        addToFavorites: '添加到收藏', removeFromFavorites: '從收藏中刪除', watchTrailer: '觀看預告片',
        aiTitle: '想睇咩?', aiGreeting: '你好！我是 CineWorld 電影助手。', aiDescribe: '描述你想睇咩:', aiExample: '例如："机器人动作片"', aiPlaceholder: '描述電影...',
        noTitle: '無標題',
        emailPlaceholder: '電子郵件', passwordPlaceholder: '密碼', registerLink: '註冊', login: '登入',
        invalidCredentials: '郵箱或密碼錯誤！', fillEmailPassword: '請填寫郵箱和密碼！', passwordMismatch: '密碼不匹配！', passwordLength: '密碼必須至少4個字符！',
        namePlaceholder: '姓名', noAccount: '沒有賬戶？', hasAccount: '已有賬戶', login: '登入',
        confirmPasswordPlaceholder: '確認密碼', createAccount: '創建賬戶',
        contactSuccess: '表單提交成功！', contactError: '提交錯誤，請重試。', contactOpenForm: '表單已打開！請填寫並發送。',
        loginFirst: '請登入以添加收藏！',
        myFavorites: '我的收藏',
        profile: '個人資料', changePassword: '修改密碼'
    },
    'ja': {
        searchPlaceholder: '映画を検索...',
        popular: '人気映画', bestRated: '高評価', worstRated: '低評価', release: '最新作', upcoming: '公開予定',
        all: 'すべて', allYears: 'すべて', national: '日本', international: '外国', originLabel: '映画:',
        genres: 'ジャンル', movies: '映画', page: 'ページ', of: '/',
        language: '言語',
        prev: '前へ', next: '次へ', details: '詳細',
        rating: '評価', year: '年', synopsis: 'あらすじ', synopsisNotAvailable: 'あらすじはありません',
        originalTitle: '原題', close: '閉じる',
        noResults: '映画が見つかりません', tryAgain: '他のジャンルで検索', resultsFor: '検索結果',
        login: 'ログイン', logout: 'ログアウト', loginTitle: 'ログイン', registerTitle: '登録', logoutMessage: 'また来てね！',
        loginDesc: 'オプションを選択してください',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '視聴', runtime: '分',
        favorites: 'お気に入り', noFavorites: 'お気に入りはまだありません！',
        welcome: 'ようこそ', sortBy: '並べ替え',
        contact: 'お問い合わせ', contactTitle: 'お問い合わせ', contactDesc: 'ご要望やお問い合わせを送信',
        name: '名前任意', type: 'タイプ', message: 'メッセージ *', send: '送信',
        suggestion: 'ご要望', compliment: 'お問い合わせ', complaint: '苦情', other: 'その他',
        footer: '© 2026 - 全著作権 | 開発',
        tagline: '映画を見つけて、視聴方法を確認',
        about: 'について', privacy: 'プライバシー', terms: '利用規約', cookies: 'Cookies',
        watch: '視聴', rent: 'レンタル', buy: '購入',
        navHome: 'ホーム', navAbout: 'について', navPrivacy: 'プライバシー', navTerms: '利用規約', navCookies: 'Cookies',
        footerAbout: 'について', footerPrivacy: 'プライバシー', footerTerms: '利用規約', footerCookies: 'Cookies',
        addToFavorites: 'お気に入りに追加', removeFromFavorites: 'お気に入りから削除', watchTrailer: '予告編を見る',
        aiTitle: '何を見たいですか？', aiGreeting: 'こんにちは！CineWorld 映画アシスタントです。', aiDescribe: '見たいものを描述:', aiExample: '例："ロボットアクション映画"', aiPlaceholder: '映画を描述...',
        noTitle: '無題',
        emailPlaceholder: 'メールアドレス', passwordPlaceholder: 'パスワード', registerLink: '登録', login: 'ログイン',
        invalidCredentials: 'メールアドレスまたはパスワードが正しくありません！', fillEmailPassword: 'メールアドレスとパスワードを入力してください！', passwordMismatch: 'パスワードが一致しません！', passwordLength: 'パスワードは4文字以上である必要があります！',
        namePlaceholder: '名前', noAccount: 'アカウントがありませんか？', hasAccount: 'すでにアカウントあり', login: 'ログイン',
        confirmPasswordPlaceholder: 'パスワード確認', createAccount: 'アカウント作成',
        contactSuccess: 'フォーム送信成功！', contactError: '送信エラー。もう一度お試しください。', contactOpenForm: 'フォームが開きました！記入して送信してください。',
        loginFirst: 'お気に入りを追加するにはログインしてください！',
        myFavorites: 'お気に入り',
        profile: 'プロフィール', changePassword: 'パスワード変更'
    },
    'ru': {
        searchPlaceholder: 'Поиск фильмов...',
        popular: 'Популярные фильмы', bestRated: 'Лучшие оценки', worstRated: 'Худшие оценки', release: 'Новейшие', upcoming: 'Скоро в прокате',
        all: 'Все', allYears: 'Все', national: 'Националные', international: 'Международные', originLabel: 'Фильмы:',
        genres: 'Жанры', movies: 'фильмов', page: 'Страница', of: 'из',
        language: 'Язык',
        prev: 'Предыдущая', next: 'Следующая', details: 'Детали',
        rating: 'Рейтинг', year: 'Год', synopsis: 'Описание', synopsisNotAvailable: 'Описание недоступно',
        originalTitle: 'Оригиналное название', close: 'Закрыть',
        noResults: 'Фильмы не найдены', tryAgain: 'Попробуйте другой жанр или поиск', resultsFor: 'Результаты для',
        login: 'Войти', logout: 'Выйти', loginTitle: 'Войти', registerTitle: 'Регистрация', logoutMessage: 'До скорой встречи！',
        loginDesc: 'Выберите вариант',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: 'Смотреть', runtime: 'мин',
        favorites: 'Избранное', noFavorites: 'У вас пока нет избранного!',
        welcome: 'Добро пожаловать', sortBy: 'Сортировать',
        contact: 'Контакт', contactTitle: 'Связаться', contactDesc: 'Отправьте ваши предложения, похвалу или жалобы',
        name: 'Имя необязательно', type: 'Тип', message: 'Сообщение *', send: 'Отправить',
        suggestion: 'Предложение', compliment: 'Похвала', complaint: 'Жалоба', other: 'Другое',
        footer: '© 2026 - Все права защищены | Разработано',
        tagline: 'Найдите фильмы и где смотреть',
        about: 'О нас', privacy: 'Конфиденциальность', terms: 'Условия', cookies: 'Cookies',
        watch: 'Смотреть', rent: 'Аренда', buy: 'Купить',
        navHome: 'Главная', navAbout: 'О нас', navPrivacy: 'Конфиденциальность', navTerms: 'Условия', navCookies: 'Cookies',
        footerAbout: 'О нас', footerPrivacy: 'Конфиденциальность', footerTerms: 'Условия', footerCookies: 'Cookies',
        addToFavorites: 'Добавить в избранное', removeFromFavorites: 'Удалить из избранного', watchTrailer: 'Смотреть трейлер',
        aiTitle: 'Что хотите смотреть?', aiGreeting: 'Привет! Я помощник фильмов CineWorld.', aiDescribe: 'Опишите, что хотите смотреть:', aiExample: 'Например: "боевик с роботами"', aiPlaceholder: 'Опишите фильм...',
        noTitle: 'Без названия',
        emailPlaceholder: 'Email', passwordPlaceholder: 'Пароль', registerLink: 'Регистрация', login: 'Войти',
        invalidCredentials: 'Неверный email или пароль!', fillEmailPassword: 'Заполните email и пароль!', passwordMismatch: 'Пароли не совпадают!', passwordLength: 'Пароль должен быть не менее 4 символов!',
        namePlaceholder: 'Имя', noAccount: 'Нет аккаунта?', hasAccount: 'Уже есть аккаунт', login: 'Войти',
        confirmPasswordPlaceholder: 'Подтвердите пароль', createAccount: 'Создайте аккаунт',
        contactSuccess: 'Форма успешно отправлена!', contactError: 'Ошибка отправки. Попробуйте снова.', contactOpenForm: 'Форма открыта! Пожалуйста, заполните и отправьте.',
        loginFirst: 'Пожалуйста, войдите, чтобы добавить в избранное!',
        myFavorites: 'Избранное',
        profile: 'Профиль', changePassword: 'Изменить пароль'
    },
    'ko': {
        searchPlaceholder: '영화 검색...',
        popular: '인기 영화', bestRated: '높은 평점', worstRated: '낮은 평점', release: '최신', upcoming: '개봉 예정',
        all: '전체', allYears: '전체', national: '국내', international: '해외', originLabel: '영화:',
        genres: '장르', movies: '편', page: '페이지', of: '/',
        language: '언어',
        prev: '이전', next: '다음', details: '상세정보',
        rating: '평점', year: '연도', synopsis: '시놉시스', synopsisNotAvailable: '시놉시스 없음',
        originalTitle: '원제', close: '닫기',
        noResults: '영화를 찾을 수 없습니다', tryAgain: '다른 장르 또는 검색을 시도하세요', resultsFor: '검색 결과',
        login: '로그인', logout: '로그아웃', loginTitle: '로그인', registerTitle: '회원가입', logoutMessage: '다음에 봐요！',
        loginDesc: '옵션을 선택하세요',
        loginGoogle: 'Google', loginFacebook: 'Facebook',
        streaming: '시청', runtime: '분',
        favorites: '즐겨찾기', noFavorites: '즐겨찾기가 아직 없습니다!',
        welcome: '환영합니다', sortBy: '정렬',
        contact: '연락', contactTitle: '연락하기', contactDesc: '제안, 칭찬 또는 불만의 보내기',
        name: '이름 선택', type: '유형', message: '메시지 *', send: '보내기',
        suggestion: '제안', compliment: '칭찬', complaint: '불만', other: '기타',
        footer: '© 2026 - 모든 권리 보유 | 개발',
        tagline: '영화 찾기 및 시청 방법',
        about: '정보', privacy: '개인정보', terms: '이용약관', cookies: 'Cookies',
        watch: '시청', rent: '대여', buy: '구매',
        navHome: '홈', navAbout: '정보', navPrivacy: '개인정보', navTerms: '이용약관', navCookies: 'Cookies',
        footerAbout: '정보', footerPrivacy: '개인정보', footerTerms: '이용약관', footerCookies: 'Cookies',
        addToFavorites: '즐겨찾기에 추가', removeFromFavorites: '즐겨찾기에서 삭제', watchTrailer: '예고편 보기',
        aiTitle: '무엇을 보고 싶나요?', aiGreeting: '안녕하세요! CineWorld 영화 도우미입니다.', aiDescribe: '보고 싶은 것을 설명:', aiExample: '예: "로봇 액션 영화"', aiPlaceholder: '영화 설명...',
        noTitle: '제목 없음',
        emailPlaceholder: '이메일', passwordPlaceholder: '비밀번호', registerLink: '회원가입', login: '로그인',
        invalidCredentials: '이메일 또는 비밀번호가不正确합니다!', fillEmailPassword: '이메일과 비밀번호를 입력하세요!', passwordMismatch: '비밀번호가 일치하지 않습니다!', passwordLength: '비밀번호는 최소 4자 이상이어야 합니다!',
        namePlaceholder: '이름', noAccount: '계정이 없으신가요?', hasAccount: '이미 계정이 있음', login: '로그인',
        confirmPasswordPlaceholder: '비밀번호 확인', createAccount: '계정 만들기',
        contactSuccess: '양식이 성공적으로 제출되었습니다!', contactError: '제출 오류. 다시 시도하십시오.', contactOpenForm: '양식이 열렸습니다! 내용을 입력하고 보내십시오.',
        loginFirst: '즐겨찾기에 추가하려면 로그인하십시오!',
        myFavorites: '나의 즐겨찾기',
        profile: '프로필', changePassword: '비밀번호 변경'
    }
};

// Translation function
function t(key) {
    try {
        const lang = translations[state.currentLanguage] || translations['pt-BR'];
        return lang[key] || translations['pt-BR'][key] || key;
    } catch(e) {
        console.error('Translation error for key:', key, 'Lang:', state.currentLanguage, 'Error:', e);
        return key;
    }
}

// API Base
const API_BASE = '/api';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initAuth();
    loadFromURL();
    setupEvents();
    updateNavLinks();
    applyTranslations();
    loadData();
    
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
});

// Load data from URL
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
        localStorage.setItem('cineworld_language', state.currentLanguage);
    } else {
        const savedLang = localStorage.getItem('cineworld_language');
        if (savedLang) {
            state.currentLanguage = savedLang;
        }
    }
    if (params.has('year')) {
        state.currentYear = params.get('year');
    }
    
    // Update UI elements from state
    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = state.currentLanguage;
    
    const genreSelect = document.getElementById('genreSelectMobile');
    if (genreSelect) genreSelect.value = state.currentGenre;
    
    const originSelect = document.getElementById('filterOriginSelect');
    if (originSelect) originSelect.value = state.currentOrigin;
    
    const sortSelect = document.getElementById('filterSortSelect');
    if (sortSelect) sortSelect.value = state.currentSort;
    
    const yearSelect = document.getElementById('filterYearSelect');
    if (yearSelect) yearSelect.value = state.currentYear;
}

// Setup event listeners
function setupEvents() {
    // Search
    const cineSearchBtn = document.getElementById('mainSearchBtn');
    const cineSearchInput = document.getElementById('mainSearchInput');
    
    if (cineSearchBtn) {
        cineSearchBtn.addEventListener('click', function() {
            performMainSearch();
        });
    }
    
    if (cineSearchInput) {
        cineSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performMainSearch();
            }
        });
    }
    
    // Language
    document.getElementById('langSelect').addEventListener('change', function() {
        state.currentLanguage = this.value;
        state.currentPage = 1;
        localStorage.setItem('cineworld_language', state.currentLanguage);
        localStorage.setItem('cineworld_lang', this.value);
        
        if (langLabel) {
            langLabel.textContent = t('language') || 'Idioma:';
        }
        
        document.getElementById('htmlLang').lang = state.currentLanguage;
        applyTranslations();
        updateNavLinks();
        updateURL();
        window.location.href = window.location.pathname + '?lang=' + state.currentLanguage;
    });
    
    // Login
    document.getElementById('authBtn').addEventListener('click', openLoginModal);
    
    // Filter origin
    document.getElementById('filterOriginSelect').addEventListener('change', function() {
        state.currentOrigin = this.value;
        state.currentPage = 1;
        loadMovies();
    });
    
    // Filter sort
    document.getElementById('filterSortSelect').addEventListener('change', function() {
        state.currentSort = this.value;
        state.currentPage = 1;
        loadMovies();
    });
    
    // Filter year
    const yearSelect = document.getElementById('filterYearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            state.currentYear = this.value;
            state.currentPage = 1;
            loadMovies();
        });
    }
    
    // Genre mobile select
    document.getElementById('genreSelectMobile').addEventListener('change', function() {
        state.currentGenre = this.value;
        state.currentPage = 1;
        state.searchQuery = '';
        const searchInputMobile = document.getElementById('mainSearchInput');
        if (searchInputMobile) searchInputMobile.value = '';
        
        updateTitle();
        loadMovies();
    });
    
    // Pagination
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
    
    // Close modals
    document.getElementById('movieModal').addEventListener('click', function(e) {
        if (e.target === this) closeMovieModal();
    });
    
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) closeLoginModal();
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMovieModal();
            closeLoginModal();
            const aiPanel = document.getElementById('aiPanel');
            if (aiPanel && aiPanel.classList.contains('open')) {
                aiPanel.classList.remove('open');
            }
        }
    });
}

// Load data (genres + movies)
async function loadData() {
    try {
        const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
        const genresRes = await fetch(API_BASE + '/genres?language=' + tmdbLang);
        const genresData = await genresRes.json();
        
        if (Array.isArray(genresData)) {
            state.genres = genresData;
            renderGenres();
            updateGenreUIFromState();
        }
        
        await loadMovies();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Render genres
function renderGenres() {
    const container = document.getElementById('genresList');
    if (!container) return;
    
    let genresHtml = `
        <div class="genre-item ${state.currentGenre === '0' ? 'active' : ''}" 
             data-id="0">
            <i class="fas fa-globe"></i>
            <span>${t('all')}</span>
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
        let optionsHtml = `<option value="0">${t('all')} ${t('genres')}</option>`;
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
            const searchInput = document.getElementById('mainSearchInput');
            if (searchInput) searchInput.value = '';
            
            document.querySelectorAll('.genre-item').forEach(g => g.classList.remove('active'));
            this.classList.add('active');
            
            updateTitle();
            loadMovies();
        });
    });
}

function updateGenreUIFromState() {
    document.querySelectorAll('.genre-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === state.currentGenre);
    });
}

// Load movies
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
        
        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages || 1, 500);
            renderMovies();
            updateUI();
        } else {
            document.getElementById('moviesGrid').innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">' + t('noResults') + '</p>';
        }
    } catch (error) {
        console.error('Error loading movies:', error);
    } finally {
        state.isLoading = false;
    }
}

// Render movies
function renderMovies() {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    
    if (state.movies.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">' + t('noResults') + '</p>';
        return;
    }
    
    container.innerHTML = state.movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
        const posterUrl = movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : 'https://image.tmdb.org/t/p/w500' + movie.poster_path) : null;
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
                        <h3 class="movie-title">${movie.title || t('noTitle')}</h3>
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

// Update UI
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
    state.currentPage = page;
    loadMovies();
};

// Update translations
function updateTranslations() {
    try {
        const lang = state.currentLanguage;
        
        const siteTagline = document.getElementById('siteTagline');
        if (siteTagline) siteTagline.textContent = t('tagline');
        
        const searchInput = document.getElementById('mainSearchInput');
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
        
        const filterYearSelect = document.getElementById('filterYearSelect');
        if (filterYearSelect && filterYearSelect.options.length > 0) {
            filterYearSelect.options[0].text = t('allYears') || 'Todos';
        }
        
        const genresTitle = document.getElementById('genresTitle');
        if (genresTitle) genresTitle.textContent = t('genres');
        
        const aiTitleText = document.getElementById('aiTitleText');
        if (aiTitleText) aiTitleText.textContent = t('aiTitle') || 'O que deseja assistir?';
        const aiGreetingText = document.getElementById('aiGreetingText');
        if (aiGreetingText) aiGreetingText.textContent = t('aiGreeting') || 'Olá! Sou a assistente de filmes do CineWorld.';
        const aiDescribeText = document.getElementById('aiDescribeText');
        if (aiDescribeText) aiDescribeText.textContent = t('aiDescribe') || 'Descreva o que você quer assistir:';
        const aiExampleText = document.getElementById('aiExampleText');
        if (aiExampleText) aiExampleText.textContent = t('aiExample') || 'Ex: "filme de ação com robôs", "comédia romântica indiana"';
        const aiSearchInput = document.getElementById('aiSearchInput');
        if (aiSearchInput) aiSearchInput.placeholder = t('aiPlaceholder') || 'Descreva o filme...';
        
        const prevText = document.getElementById('prevText');
        if (prevText) prevText.textContent = t('prev');
        const nextText = document.getElementById('nextText');
        if (nextText) nextText.textContent = t('next');
        
        const navHome = document.getElementById('navHome');
        if (navHome) navHome.textContent = t('navHome');
        const navAbout = document.getElementById('navAbout');
        if (navAbout) navAbout.textContent = t('navAbout');
        const navPrivacy = document.getElementById('navPrivacy');
        if (navPrivacy) navPrivacy.textContent = t('navPrivacy');
        const navTerms = document.getElementById('navTerms');
        if (navTerms) navTerms.textContent = t('navTerms');
        const navCookies = document.getElementById('navCookies');
        if (navCookies) navCookies.textContent = t('navCookies');
        
        const navAboutLink = document.getElementById('navAboutLink');
        if (navAboutLink) navAboutLink.href = getLegalPageUrl('about');
        const navPrivacyLink = document.getElementById('navPrivacyLink');
        if (navPrivacyLink) navPrivacyLink.href = getLegalPageUrl('privacy');
        const navTermsLink = document.getElementById('navTermsLink');
        if (navTermsLink) navTermsLink.href = getLegalPageUrl('terms');
        const navCookiesLink = document.getElementById('navCookiesLink');
        if (navCookiesLink) navCookiesLink.href = getLegalPageUrl('cookies');
        
        const footerAbout = document.getElementById('footerAbout');
        if (footerAbout) {
            footerAbout.textContent = t('footerAbout');
            footerAbout.href = getLegalPageUrl('about');
        }
        const footerPrivacy = document.getElementById('footerPrivacy');
        if (footerPrivacy) {
            footerPrivacy.textContent = t('footerPrivacy');
            footerPrivacy.href = getLegalPageUrl('privacy');
        }
        const footerTerms = document.getElementById('footerTerms');
        if (footerTerms) {
            footerTerms.textContent = t('footerTerms');
            footerTerms.href = getLegalPageUrl('terms');
        }
        const footerCookies = document.getElementById('footerCookies');
        if (footerCookies) {
            footerCookies.textContent = t('footerCookies');
            footerCookies.href = getLegalPageUrl('cookies');
        }
        
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
        
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.textContent = t('registerTitle') || 'Cadastrar';
        }
        
        updateFavoritesCount();
    } catch (e) {
        console.error('Error updating translations:', e);
    }
}

// Update footer
function updateFooter() {
    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.innerHTML = `
            <div class="platforms-icons">
                <a href="https://www.netflix.com" target="_blank" rel="noopener" title="Netflix">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" class="platform-img" style="height: 34px; width: auto;">
                </a>
                <a href="https://www.primevideo.com" target="_blank" rel="noopener" title="Prime Video">
                    <img src="https://i.pinimg.com/736x/a3/9e/e9/a39ee9b903a46c029b2cce3a923ae42e.jpg" alt="Prime Video" style="height: 38px; width: auto;">
                </a>
                <a href="https://www.disneyplus.com" target="_blank" rel="noopener" title="Disney+">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" style="height: 22px; width: auto; filter: brightness(0) invert(1);">
                </a>
                <a href="https://www.max.com" target="_blank" rel="noopener" title="Max (HBO)">
                    <img src="https://www.citypng.com/public/uploads/preview/hbo-max-white-logo-png-701751694707739y4d41kme7y.png" alt="Max" class="platform-img" style="height: 38px; width: auto;">
                </a>
                <a href="https://globoplay.globo.com" target="_blank" rel="noopener" title="Globoplay">
                    <img src="https://static.wixstatic.com/media/64ad72_f22b0aff0a514bb7b341dcf7740ca3ce~mv2.png/v1/fill/w_456,h_468,al_c/globoplayicon.png" alt="Globoplay" class="platform-img" style="height: 40px; width: auto;">
                </a>
                <a href="https://pluto.tv" target="_blank" rel="noopener" title="Pluto TV">
                    <img src="https://images.seeklogo.com/logo-png/52/3/pluto-tv-logo-png_seeklogo-520780.png" alt="Pluto TV" class="platform-img" style="height: 40px; width: auto;">
                </a>
            </div>
            <div class="footer-links">
                <a href="/sobre" id="footerAbout">${t('about')}</a>
                <span class="footer-divider">|</span>
                <a href="/privacidade" id="footerPrivacy">${t('privacy')}</a>
                <span class="footer-divider">|</span>
                <a href="/termos" id="footerTerms">${t('terms')}</a>
                <span class="footer-divider">|</span>
                <a href="/cookies" id="footerCookies">${t('cookies')}</a>
            </div>
            <p>&copy; 2026 - Todos os direitos reservados | Desenvolvido por <strong>Brenda Tavares</strong></p>
        `;
    }
}

// Update title
function updateTitle() {
    const titleEl = document.getElementById('currentTitle');
    if (!titleEl) return;
    
    if (state.searchQuery) {
        titleEl.textContent = t('resultsFor') + ': ' + state.searchQuery;
    } else if (state.currentGenre === '0') {
        titleEl.textContent = t('popular');
    } else {
        const genre = state.genres.find(g => g.id.toString() === state.currentGenre);
        titleEl.textContent = genre ? genre.name : t('genres');
    }
}

// Update URL
function updateURL() {
    const params = new URLSearchParams();
    
    if (state.currentPage > 1) params.set('page', state.currentPage);
    if (state.currentSort !== 'popularity') params.set('sort', state.currentSort);
    if (state.currentGenre !== '0') params.set('genre', state.currentGenre);
    if (state.currentOrigin !== 'all') params.set('origin', state.currentOrigin);
    if (state.currentLanguage !== 'pt-BR') params.set('lang', state.currentLanguage);
    if (state.currentYear) params.set('year', state.currentYear);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newURL);
}

// Legal page URLs
const legalPagePaths = {
    'pt-BR': { about: '/sobre', privacy: '/privacidade', terms: '/termos', cookies: '/cookies' },
    'en': { about: '/en/sobre', privacy: '/en/privacidade', terms: '/en/termos', cookies: '/en/cookies' },
    'es': { about: '/es/sobre', privacy: '/es/privacidade', terms: '/es/termos', cookies: '/es/cookies' },
    'zh-CN': { about: '/zh/sobre', privacy: '/zh/privacidade', terms: '/zh/termos', cookies: '/zh/cookies' },
    'zh-HK': { about: '/zh/sobre', privacy: '/zh/privacidade', terms: '/zh/termos', cookies: '/zh/cookies' },
    'ja': { about: '/ja/sobre', privacy: '/ja/privacidade', terms: '/ja/termos', cookies: '/ja/cookies' },
    'ru': { about: '/ru/sobre', privacy: '/ru/privacidade', terms: '/ru/termos', cookies: '/ru/cookies' },
    'ko': { about: '/ko/sobre', privacy: '/ko/privacidade', terms: '/ko/termos', cookies: '/ko/cookies' }
};

function getLegalPageUrl(pageType) {
    const lang = state.currentLanguage;
    const paths = legalPagePaths[lang] || legalPagePaths['pt-BR'];
    return paths[pageType] || paths.about;
}

function updateNavLinks() {
    const navAboutLink = document.getElementById('navAboutLink');
    const navPrivacyLink = document.getElementById('navPrivacyLink');
    const navTermsLink = document.getElementById('navTermsLink');
    const navCookiesLink = document.getElementById('navCookiesLink');
    const footerAbout = document.getElementById('footerAbout');
    const footerPrivacy = document.getElementById('footerPrivacy');
    const footerTerms = document.getElementById('footerTerms');
    const footerCookies = document.getElementById('footerCookies');

    if (navAboutLink) navAboutLink.href = getLegalPageUrl('about');
    if (navPrivacyLink) navPrivacyLink.href = getLegalPageUrl('privacy');
    if (navTermsLink) navTermsLink.href = getLegalPageUrl('terms');
    if (navCookiesLink) navCookiesLink.href = getLegalPageUrl('cookies');
    if (footerAbout) footerAbout.href = getLegalPageUrl('about');
    if (footerPrivacy) footerPrivacy.href = getLegalPageUrl('privacy');
    if (footerTerms) footerTerms.href = getLegalPageUrl('terms');
    if (footerCookies) footerCookies.href = getLegalPageUrl('cookies');
}

function applyTranslations() {
    const lang = translations[state.currentLanguage] || translations['pt-BR'];
    if (!lang) return;
    
    const elements = {
        'siteTagline': 'tagline',
        'navHome': 'navHome',
        'navAbout': 'navAbout',
        'navPrivacy': 'navPrivacy',
        'navTerms': 'navTerms',
        'navCookies': 'navCookies',
        'footerAbout': 'footerAbout',
        'footerPrivacy': 'footerPrivacy',
        'footerTerms': 'footerTerms',
        'footerCookies': 'footerCookies',
        'langLabel': 'language'
    };
    
    for (const [id, key] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el && lang[key]) {
            if (id === 'langLabel') {
                el.textContent = lang[key] + ':';
            } else {
                const icon = el.querySelector('i');
                const textSpan = el.querySelector('span');
                if (textSpan && lang[key]) {
                    textSpan.textContent = lang[key];
                }
            }
        }
    }
}

// Search
function performMainSearch() {
    const input = document.getElementById('mainSearchInput');
    const query = input ? input.value.trim() : '';
    if (!query) return;
    
    document.getElementById('moviesGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> <span>' + t('searching') + '...</span></div>';
    
    useAISearch(query);
}

async function useAISearch(query) {
    state.searchQuery = query;
    state.currentPage = 1;
    state.currentGenre = '0';
    
    const params = new URLSearchParams();
    params.set('q', query);
    window.history.pushState({}, '', '?' + params.toString());
    
    const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
    const url = API_BASE + '/ai-search?q=' + encodeURIComponent(query) + '&page=1&language=' + tmdbLang;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages || 1, 500);
            renderMovies();
            updateUI();
        } else {
            await loadMovies();
        }
    } catch (error) {
        console.error('Search error:', error);
        await loadMovies();
    }
}

// AI Search panel
window.toggleAIPanel = function() {
    const panel = document.getElementById('aiPanel');
    panel.classList.toggle('open');
};

window.performAiSearch = function() {
    const input = document.getElementById('aiInput');
    const query = input ? input.value.trim() : '';
    if (!query) return;
    
    const resultsDiv = document.getElementById('aiResults');
    resultsDiv.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> <span>' + t('analyzing') + '...</span></div>';
    
    const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
    const url = API_BASE + '/ai-search?q=' + encodeURIComponent(query) + '&page=1&language=' + tmdbLang;
    
    fetch(url).then(res => res.json()).then(data => {
        if (data.results && data.results.length > 0) {
            state.movies = data.results;
            state.totalPages = Math.min(data.total_pages || 1, 500);
            state.searchQuery = query;
            state.currentPage = 1;
            renderMovies();
            updateUI();
            document.getElementById('currentTitle').textContent = t('resultsFor') + ': ' + query;
            panel.classList.remove('open');
        } else {
            resultsDiv.innerHTML = '<p style="text-align:center;color:var(--text-muted);">' + t('noResults') + '</p>';
        }
    }).catch(err => {
        console.error('AI search error:', err);
        resultsDiv.innerHTML = '<p style="text-align:center;color:var(--text-muted);">' + t('error') + '</p>';
    });
};

// Show movie details
window.showMovieDetails = async function(movieId) {
    try {
        const tmdbLang = languageMap[state.currentLanguage] || 'pt-BR';
        const response = await fetch(API_BASE + '/movie?id=' + movieId + '&language=' + tmdbLang);
        const data = await response.json();
        
        if (data.movie) {
            showMovieModal(data.movie);
        } else if (data.error) {
            showToast('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading movie:', error);
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
            'netflix': 'https://www.netflix.com',
            'netflix standard with ads': 'https://www.netflix.com',
'amazon prime video': 'https://www.primevideo.com',
            'prime video': 'https://www.primevideo.com',
            'amazon': 'https://www.primevideo.com',
            'prime': 'https://www.primevideo.com',
            'disney+': 'https://www.disneyplus.com',
            'disney plus': 'https://www.disneyplus.com',
            'disney': 'https://www.disneyplus.com',
            'hbo max': 'https://www.max.com',
            'hbo': 'https://www.max.com',
            'max': 'https://www.max.com',
            'paramount+': 'https://www.paramountplus.com',
            'paramount plus': 'https://www.paramountplus.com',
            'paramount': 'https://www.paramountplus.com',
            'apple tv+': 'https://tv.apple.com',
            'apple tv': 'https://tv.apple.com',
            'apple': 'https://tv.apple.com',
            'google play movies': 'https://play.google.com/store/movies',
            'google play': 'https://play.google.com/store/movies',
            'youtube': 'https://www.youtube.com',
            'crunchyroll': 'https://www.crunchyroll.com',
            'globoplay': 'https://globoplay.globo.com',
            'claro tv+': 'https://www.claro.com.br/tvplus',
            'claro video': 'https://www.claro.com.br/tvplus',
            'tubi': 'https://tubi.tv',
            'pluto tv': 'https://pluto.tv',
            'peacock': 'https://www.peacocktv.com',
            'peacock tv': 'https://www.peacocktv.com',
            'rakuten tv': 'https://www.rakutentv.com',
            'rakuten': 'https://www.rakutentv.com',
            'mubi': 'https://mubi.com',
            'arte': 'https://www.arte.tv',
            'klub': 'https://www.klub.tv',
            'screen media': 'https://screenmedia.tv',
            'cineb': 'https://www.cineb.net',
            'filmot': 'https://filmot.org',
            'fandor': 'https://www.fandor.com',
            'vimeo': 'https://vimeo.com',
            'viki': 'https://www.viki.com',
            'sony crackle': 'https://www.crackle.com',
            'crackle': 'https://www.crackle.com',
            'freevee': 'https://www.freevee.com',
            'twitch': 'https://www.twitch.tv',
            'star+': 'https://www.starplus.com',
            'star plus': 'https://www.starplus.com',
            'movistar+': 'https://ver.movistarplus.es',
            'sky': 'https://www.sky.com',
            'now tv': 'https://www.nowtv.it',
            'itv': 'https://www.itv.com',
            'all 4': 'https://www.channel4.com',
            'bbc i player': 'https://www.bbc.co.uk/iplayer',
            'hulu': 'https://www.hulu.com',
            'directv': 'https://www.directv.com',
            'fandango at home': 'https://athome.fandango.com',
            'vudu': 'https://vudu.com',
            'fandango': 'https://athome.fandango.com',
            'sonyliv': 'https://www.sonyliv.com',
            'zee5': 'https://www.zee5.com',
            'jio cinema': 'https://www.jiocinema.com',
            'voot': 'https://www.voot.com',
            'eros now': 'https://erosnow.com',
            'shahid': 'https://shahid.mbc.net',
            'osn': 'https://www.osn.com',
            'stan': 'https://www.stan.com.au',
            'fetch tv': 'https://www.fetchtv.com.au',
            'binge': 'https://www.binge.com.au'
};
        
        const getPlatformUrl = (platformName) => {
            const normalized = platformName.toLowerCase().replace(/\s+/g, ' ').trim();
            for (const [key, url] of Object.entries(platformUrls)) {
                if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
                    return url;
                }
            }
            return null;
        };
        
        const flatrate = movie.streaming.filter(p => p.type === 'flatrate' && !p.isFree);
        const flatrateFree = movie.streaming.filter(p => p.type === 'flatrate' && p.isFree);
        const rent = movie.streaming.filter(p => p.type === 'rent');
        const buy = movie.streaming.filter(p => p.type === 'buy');
        const freeAlt = movie.streaming.filter(p => p.type === 'free-alt');
        
        const langStreaming = translations[state.currentLanguage] || translations['pt-BR'];
        
        let html = '<div class="modal-platforms">';
        
        if (flatrate.length > 0 || flatrateFree.length > 0 || freeAlt.length > 0) {
            html += '<h4><i class="fas fa-play"></i> ' + langStreaming.watch + '</h4>';
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
                    const url = getPlatformUrl(p.name);
                    if (url) {
                        return `<a href="${url}" target="_blank" class="stream-tag stream-free" title="${p.name} (Gratuito)">
                            <span>${p.name}</span>
                            <i class="fas fa-tag" title="Gratuito"></i>
                        </a>`;
                    }
                    return '';
                }).join('');
            }
            
            if (flatrate.length > 0) {
                html += flatrate.map(p => {
                    const url = getPlatformUrl(p.name);
                    if (url) {
                        return `<a href="${url}" target="_blank" class="stream-tag" title="${p.name}">
                            <span>${p.name}</span>
                        </a>`;
                    }
                    return '';
                }).join('');
            }
            
            html += '</div>';
        }
        
        if (rent.length > 0) {
            html += '<h4><i class="fas fa-shopping-cart"></i> ' + langStreaming.rent + '</h4>';
            html += '<div class="streaming-list">';
            html += rent.map(p => {
                const url = getPlatformUrl(p.name);
                if (url) {
                    return `<a href="${url}" target="_blank" class="stream-tag stream-rent" title="Alugar em ${p.name}">
                        <span>${p.name}</span>
                    </a>`;
                }
                return '';
            }).join('');
            html += '</div>';
        }
        
        if (buy.length > 0) {
            html += '<h4><i class="fas fa-shopping-bag"></i> ' + langStreaming.buy + '</h4>';
            html += '<div class="streaming-list">';
            html += buy.map(p => {
                const url = getPlatformUrl(p.name);
                if (url) {
                    return `<a href="${url}" target="_blank" class="stream-tag stream-buy" title="Comprar em ${p.name}">
                        <span>${p.name}</span>
                    </a>`;
                }
                return '';
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
                <p class="modal-desc">${movie.overview || t('synopsisNotAvailable')}</p>
                ${movie.original_title !== movie.title ? 
                    `<p><strong>${t('originalTitle')}:</strong> ${movie.original_title}</p>` : ''}
                ${trailerLink ? `
                <a href="${trailerLink}" 
                   target="_blank" 
                   class="trailer-btn">
                    <i class="fab fa-youtube"></i>
                    <span>${t('watchTrailer')}</span>
                </a>` : ''}
                <button class="fav-btn-large ${isFav ? 'active' : ''}" 
                        onclick="toggleFavorite(${movie.id})">
                    <i class="fas fa-heart"></i>
                    <span>${isFav ? t('removeFromFavorites') : t('addToFavorites')}</span>
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

// Navigation
function toggleNavMenu() {
    document.getElementById('navMenu').classList.toggle('open');
}

// Favorites - now using Supabase
function toggleFavorite(movieId) {
    if (!currentUser) {
        showToast(t('loginFirst') || 'Por favor, entre na sua conta para adicionar favoritos!');
        openLoginModal();
        return;
    }
    
    const index = favorites.indexOf(movieId);
    const isAdding = index === -1;
    
    if (isAdding) {
        favorites.push(movieId);
    } else {
        favorites.splice(index, 1);
    }
    
    updateFavoritesCount();
    renderMovies();
    
    const modal = document.getElementById('movieModal');
    if (modal.classList.contains('open')) {
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) showMovieModal(movie);
    }
    
    // Sync with Supabase
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
            showToast(t('syncError') || 'Erro ao sincronizar favoritos.');
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
        showToast(t('noFavorites') || 'Você ainda não tem filmes favoritos!');
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

// Login/Register functions
function openLoginModal() {
    if (currentUser) {
        showToast(t('welcome') + ', ' + currentUser.name + '!');
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
    document.getElementById('loginModalTitle').textContent = t('loginTitle');
    document.getElementById('loginSubTitle').textContent = t('loginDesc');
    
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) emailInput.placeholder = t('emailPlaceholder') || 'Email';
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) passwordInput.placeholder = t('passwordPlaceholder') || 'Senha';
    const loginBtn = document.querySelector('#loginForm button[onclick="doLogin()"]');
    if (loginBtn) loginBtn.textContent = t('login');
    
    const noAccountText = document.getElementById('noAccountText');
    if (noAccountText) {
        noAccountText.innerHTML = t('noAccount') + ' <a href="#" onclick="showRegister(event)" style="color: var(--accent);">' + t('registerLink') + '</a>';
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginModalTitle').textContent = t('registerTitle') || 'Cadastrar';
    
    const registerSubTitle = document.getElementById('registerSubTitle');
    if (registerSubTitle) registerSubTitle.textContent = t('createAccount') || 'Crie sua conta';
    
    const nameInput = document.getElementById('registerName');
    if (nameInput) nameInput.placeholder = t('namePlaceholder') || 'Nome';
    const emailInput = document.getElementById('registerEmail');
    if (emailInput) emailInput.placeholder = t('emailPlaceholder') || 'Email';
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) passwordInput.placeholder = t('passwordPlaceholder') || 'Senha';
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    if (confirmPasswordInput) confirmPasswordInput.placeholder = t('confirmPasswordPlaceholder') || 'Confirmar Senha';
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) registerBtn.textContent = t('registerTitle') || 'Cadastrar';
    
    const hasAccountText = document.getElementById('hasAccountText');
    if (hasAccountText) {
        hasAccountText.innerHTML = t('hasAccount') + ' <a href="#" onclick="showLogin(event)" style="color: var(--accent);">' + t('login') + '</a>';
    }
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
        showToast(t('fillAllFields') || 'Preencha todos os campos!');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast(t('passwordMismatch') || 'As senhas não coincidem!');
        return;
    }
    
    if (password.length < 4) {
        showToast(t('passwordLength') || 'A senha deve ter pelo menos 4 caracteres!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showToast(t('emailExists') || 'Este email já está cadastrado!');
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
    console.log('New user registered:', newUser);
    localStorage.setItem('cineworld_users', JSON.stringify(users));
    console.log('All users after registration:', JSON.parse(localStorage.getItem('cineworld_users') || '[]'));
    
    doLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
    showToast(t('accountCreated') || 'Conta criada com sucesso! Bem-vindo, ' + name + '!');
}

function doLogin(userObj) {
    if (userObj) {
        currentUser = userObj;
        localStorage.setItem('cineworld_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeLoginModal();
        showToast((t('welcome') || 'Bem-vindo!') + ' ' + currentUser.name);
    } else {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showToast(t('fillEmailPassword') || 'Preencha email e senha!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('cineworld_users') || '[]');
        console.log('Users in storage:', users);
        console.log('Trying to login with:', email, password);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const loginUser = { id: user.id, name: user.name, email: user.email };
            currentUser = loginUser;
            localStorage.setItem('cineworld_user', JSON.stringify(loginUser));
            
            updateAuthUI();
            closeLoginModal();
            
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            
            showToast(t('welcomeBack') || 'Bem-vindo de volta, ' + user.name + '!');
        } else {
            showToast(t('invalidCredentials') || 'Email ou senha incorretos!');
        }
    }
}

window.logout = function() {
    currentUser = null;
    favorites = [];
    localStorage.removeItem('cineworld_user');
    localStorage.removeItem('cineworld_favorites');
    updateAuthUI();
    updateFavoritesCount();
    showToast(t('logoutMessage') || 'Volte logo!');
};

function updateAuthUI() {
    const btn = document.getElementById('authBtn');
    const text = document.getElementById('authText');
    
    if (currentUser) {
        btn.innerHTML = `<i class="fas fa-user-check"></i><span>${currentUser.name}</span>`;
    } else {
        btn.innerHTML = `<i class="fas fa-user"></i><span>${t('login')}</span>`;
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (!currentUser) {
        openLoginModal();
        return;
    }
    if (menu.style.display === 'none') {
        const userMenuContent = document.getElementById('userMenuContent');
        userMenuContent.innerHTML = `
            <div class="user-menu-item" onclick="showProfile()">
                <i class="fas fa-user"></i> ${t('profile') || 'Perfil'}
            </div>
            <div class="user-menu-item" onclick="showFavorites()">
                <i class="fas fa-heart"></i> ${t('myFavorites') || 'Meus Favoritos'}
            </div>
            <div class="user-menu-item" onclick="showChangePassword()">
                <i class="fas fa-key"></i> ${t('changePassword') || 'Alterar Senha'}
            </div>
            <div class="user-menu-divider"></div>
            <div class="user-menu-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> ${t('logout') || 'Sair'}
            </div>
        `;
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

function showProfile() {
    toggleUserMenu();
    showToast(t('profile') + ': ' + currentUser.name);
}

function showChangePassword() {
    toggleUserMenu();
    // Implementation for change password
    showToast(t('changePassword') || 'Funcionalidade em desenvolvimento');
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('authBtn');
    if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

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



// Google login handler
window.handleGoogleLogin = function(response) {
    try {
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
        
        showToast(t('welcome') + ', ' + user.name + '!');
    } catch (error) {
        console.error('Google login error:', error);
        showToast(t('loginError') || 'Erro no login com Google.');
    }
};

console.log('CineWorld script loaded successfully');
