import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import type { User } from '@supabase/supabase-js';

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
  total_duration?: number;
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

export interface PublicPlaylistWithOwner extends UserPlaylist {
  owner_username?: string;
  owner_display_name?: string;
  owner_avatar_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserPlaylistsService {
  private supabase = inject(SupabaseService);
  
  private playlistsSubject = new BehaviorSubject<UserPlaylist[]>([]);
  public playlists$ = this.playlistsSubject.asObservable();
  
  private publicPlaylistsSubject = new BehaviorSubject<PublicPlaylistWithOwner[]>([]);
  public publicPlaylists$ = this.publicPlaylistsSubject.asObservable();

  constructor() {
    this.loadUserPlaylists();
  }

  async loadUserPlaylists(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      const { data, error } = await this.supabase.client
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading playlists:', error);
        return;
      }

      this.playlistsSubject.next(data || []);
    } catch (error) {
      console.error('Error in loadUserPlaylists:', error);
    }
  }

  async searchPublicPlaylists(query: string): Promise<{ success: boolean; playlists?: PublicPlaylistWithOwner[]; error?: string }> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const { data, error } = await this.supabase.client
        .from('playlists')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching public playlists:', error);
        return { success: false, error: error.message };
      }

      const playlistsWithOwner = (data || []).map((item: any) => ({
        ...item,
        owner_username: item.profiles?.username,
        owner_display_name: item.profiles?.display_name,
        owner_avatar_url: item.profiles?.avatar_url
      }));

      this.publicPlaylistsSubject.next(playlistsWithOwner);
      return { success: true, playlists: playlistsWithOwner };
    } catch (error) {
      console.error('Error in searchPublicPlaylists:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async getPublicPlaylists(limit: number = 20): Promise<{ success: boolean; playlists?: PublicPlaylistWithOwner[]; error?: string }> {
    try {
      const { data, error } = await this.supabase.client
        .from('playlists')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting public playlists:', error);
        return { success: false, error: error.message };
      }

      const playlistsWithOwner = (data || []).map((item: any) => ({
        ...item,
        owner_username: item.profiles?.username,
        owner_display_name: item.profiles?.display_name,
        owner_avatar_url: item.profiles?.avatar_url
      }));

      this.publicPlaylistsSubject.next(playlistsWithOwner);
      return { success: true, playlists: playlistsWithOwner };
    } catch (error) {
      console.error('Error in getPublicPlaylists:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async createPlaylist(name: string, description?: string, isPublic: boolean = false): Promise<{ success: boolean; playlist?: UserPlaylist; error?: string }> {
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
          is_public: isPublic
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating playlist:', error);
        return { success: false, error: error.message };
      }

      const newPlaylist = { ...data, song_count: 0, total_duration: 0 } as UserPlaylist;
      
      const currentPlaylists = this.playlistsSubject.value;
      this.playlistsSubject.next([newPlaylist, ...currentPlaylists]);

      return { success: true, playlist: newPlaylist };
    } catch (error) {
      console.error('Error in createPlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async updatePlaylist(playlistId: string, updates: { name?: string; description?: string; is_public?: boolean; cover_image_url?: string }): Promise<{ success: boolean; error?: string }> {
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
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: playlist } = await this.supabase.client
        .from('playlists')
        .select('id, user_id')
        .eq('id', playlistId)
        .eq('user_id', user.id)
        .single();

      if (!playlist) {
        return { success: false, error: 'Playlist no encontrada' };
      }

      const { data: existingSong } = await this.supabase.client
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .single();

      if (existingSong) {
        return { success: false, error: 'La canción ya está en esta playlist' };
      }

      const { count } = await this.supabase.client
        .from('playlist_songs')
        .select('*', { count: 'exact', head: true })
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

      const currentPlaylists = this.playlistsSubject.value;
      const updatedPlaylists = currentPlaylists.map(p => 
        p.id === playlistId 
          ? { ...p, song_count: (p.song_count || 0) + 1, total_duration: (p.total_duration || 0) + (song.duration || 0) }
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

      await this.loadUserPlaylists();

      return { success: true };
    } catch (error) {
      console.error('Error in removeSongFromPlaylist:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async reorderSong(playlistId: string, songId: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: playlist } = await this.supabase.client
        .from('playlists')
        .select('id, user_id')
        .eq('id', playlistId)
        .eq('user_id', user.id)
        .single();

      if (!playlist) {
        return { success: false, error: 'Playlist no encontrada' };
      }

      const { data: songs, error: fetchError } = await this.supabase.client
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      if (!songs) {
        return { success: false, error: 'No se encontraron canciones' };
      }

      const songIndex = songs.findIndex(s => s.song_id === songId);
      if (songIndex === -1) {
        return { success: false, error: 'Canción no encontrada en la playlist' };
      }

      const [movedSong] = songs.splice(songIndex, 1);
      songs.splice(newPosition - 1, 0, movedSong);

      const updates = songs.map((song, index) => ({
        id: song.id,
        position: index + 1
      }));

      for (const update of updates) {
        await this.supabase.client
          .from('playlist_songs')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in reorderSong:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async moveSongPosition(playlistId: string, fromPosition: number, toPosition: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: songs, error: fetchError } = await this.supabase.client
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (fetchError || !songs) {
        return { success: false, error: 'Error al cargar canciones' };
      }

      const [movedSong] = songs.splice(fromPosition - 1, 1);
      songs.splice(toPosition - 1, 0, movedSong);

      for (let i = 0; i < songs.length; i++) {
        await this.supabase.client
          .from('playlist_songs')
          .update({ position: i + 1 })
          .eq('id', songs[i].id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in moveSongPosition:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  getPlaylists(): Observable<UserPlaylist[]> {
    return this.playlists$;
  }

  getPublicPlaylistsObservable(): Observable<PublicPlaylistWithOwner[]> {
    return this.publicPlaylists$;
  }
}