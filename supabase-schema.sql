-- Tabela de usuários (opcional, já que usamos auth do Supabase)
-- Mas como você já tem login local, vou criar tabela de favoritos

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    movie_id INTEGER NOT NULL,
    movie_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, movie_id)
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_favorites_user_email ON public.favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON public.favorites(movie_id);

-- RLS (Row Level Security) - opcional para segurança
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view own favorites" 
    ON public.favorites 
    FOR SELECT 
    USING (auth.email() = user_email);

-- Política: usuários podem inserir seus próprios favoritos
CREATE POLICY "Users can insert own favorites" 
    ON public.favorites 
    FOR INSERT 
    WITH CHECK (auth.email() = user_email);

-- Política: usuários podem deletar seus próprios favoritos
CREATE POLICY "Users can delete own favorites" 
    ON public.favorites 
    FOR DELETE 
    USING (auth.email() = user_email);

-- Comentários
COMMENT ON TABLE public.favorites IS 'Tabela de filmes favoritos por usuário';
COMMENT ON COLUMN public.favorites.user_email IS 'Email do usuário (identificador)';
COMMENT ON COLUMN public.favorites.movie_id IS 'ID do filme no TMDB';
COMMENT ON COLUMN public.favorites.movie_data IS 'Dados do filme em JSON para cache';
