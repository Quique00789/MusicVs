import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  song_count?: number;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_duration?: number;
  song_cover_url?: string;
  position: number;
  added_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserPlaylistsService {
  private supabase = inject(SupabaseService);
  
  private playlistsSubject = new BehaviorSubject<UserPlaylist[]>([]);
  public playlists$ = this.playlistsSubject.asObservable();

  constructor() {
    this.loadUserPlaylists();
  }

  async loadUserPlaylists(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      const { data, error } = await this.supabase.client
        .from('playlists')
        .select(`
          *,
          song_count:playlist_songs(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading playlists:', error);
        return;
      }

      // Procesar el conteo de canciones
      const playlistsWithCount = (data || []).map(playlist => ({
        ...playlist,
        song_count: playlist.song_count?.[0]?.count || 0
      }));

      this.playlistsSubject.next(playlistsWithCount);
    } catch (error) {
      console.error('Error in loadUserPlaylists:', error);
    }
  }

  async createPlaylist(name: string, description?: string): Promise<{ success: boolean; playlist?: UserPlaylist; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase.client
        .from('playlists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
          is_public: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating playlist:', error);
        return { success: false, error: error.message };
      }

      const newPlaylist = { ...data, song_count: 0 };
      
      // Actualizar el estado local
      const currentPlaylists = this.playlistsSubject.value;
      this.playlistsSubject.next([newPlaylist, ...currentPlaylists]);

      return { success: true, playlist: newPlaylist };
    } catch (error) {
      console.error('Error in createPlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async updatePlaylist(playlistId: string, updates: { name?: string; description?: string; is_public?: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await this.supabase.client
        .from('playlists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating playlist:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el estado local
      const currentPlaylists = this.playlistsSubject.value;
      const updatedPlaylists = currentPlaylists.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, ...updates, updated_at: new Date().toISOString() }
          : playlist
      );
      this.playlistsSubject.next(updatedPlaylists);

      return { success: true };
    } catch (error) {
      console.error('Error in updatePlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async deletePlaylist(playlistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await this.supabase.client
        .from('playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting playlist:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el estado local
      const currentPlaylists = this.playlistsSubject.value;
      this.playlistsSubject.next(currentPlaylists.filter(playlist => playlist.id !== playlistId));

      return { success: true };
    } catch (error) {
      console.error('Error in deletePlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async getPlaylistSongs(playlistId: string): Promise<{ success: boolean; songs?: PlaylistSong[]; error?: string }> {
    try {
      const { data, error } = await this.supabase.client
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading playlist songs:', error);
        return { success: false, error: error.message };
      }

      return { success: true, songs: data || [] };
    } catch (error) {
      console.error('Error in getPlaylistSongs:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async addSongToPlaylist(playlistId: string, song: {
    id: string;
    title: string;
    artist: string;
    duration?: number;
    cover?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar que la playlist pertenece al usuario
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: playlist } = await this.supabase.client
        .from('playlists')
        .select('id')
        .eq('id', playlistId)
        .eq('user_id', user.id)
        .single();

      if (!playlist) {
        return { success: false, error: 'Playlist no encontrada' };
      }

      // Obtener la siguiente posición
      const { count } = await this.supabase.client
        .from('playlist_songs')
        .select('*', { count: 'exact' })
        .eq('playlist_id', playlistId);

      const { error } = await this.supabase.client
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song.id,
          song_title: song.title,
          song_artist: song.artist,
          song_duration: song.duration,
          song_cover_url: song.cover,
          position: (count || 0) + 1
        });

      if (error) {
        console.error('Error adding song to playlist:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el conteo de canciones en el estado local
      const currentPlaylists = this.playlistsSubject.value;
      const updatedPlaylists = currentPlaylists.map(p => 
        p.id === playlistId 
          ? { ...p, song_count: (p.song_count || 0) + 1 }
          : p
      );
      this.playlistsSubject.next(updatedPlaylists);

      return { success: true };
    } catch (error) {
      console.error('Error in addSongToPlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) {
        console.error('Error removing song from playlist:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el conteo de canciones en el estado local
      const currentPlaylists = this.playlistsSubject.value;
      const updatedPlaylists = currentPlaylists.map(p => 
        p.id === playlistId 
          ? { ...p, song_count: Math.max((p.song_count || 1) - 1, 0) }
          : p
      );
      this.playlistsSubject.next(updatedPlaylists);

      return { success: true };
    } catch (error) {
      console.error('Error in removeSongFromPlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  getPlaylists(): Observable<UserPlaylist[]> {
    return this.playlists$;
  }
}