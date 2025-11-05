-- Tabla para perfiles de usuario extendidos
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabla para playlists de usuario
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para canciones en playlists
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  song_id VARCHAR(255) NOT NULL, -- ID de la canción de tu fuente de música
  song_title VARCHAR(255) NOT NULL,
  song_artist VARCHAR(255) NOT NULL,
  song_duration INTEGER, -- duración en segundos
  song_cover_url TEXT,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para canciones favoritas de usuario
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  song_id VARCHAR(255) NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  song_artist VARCHAR(255) NOT NULL,
  song_duration INTEGER,
  song_cover_url TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para playlists
CREATE POLICY "Users can view their own playlists" ON playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create playlists" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON playlists FOR DELETE USING (auth.uid() = user_id);

-- Políticas para playlist_songs
CREATE POLICY "Users can view songs from their playlists" ON playlist_songs FOR SELECT 
USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));
CREATE POLICY "Users can add songs to their playlists" ON playlist_songs FOR INSERT 
WITH CHECK (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));
CREATE POLICY "Users can update songs in their playlists" ON playlist_songs FOR UPDATE 
USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete songs from their playlists" ON playlist_songs FOR DELETE 
USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));

-- Políticas para user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, new.email, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_position ON playlist_songs(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_song_id ON user_favorites(user_id, song_id);