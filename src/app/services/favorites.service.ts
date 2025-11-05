import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FavoriteSong {
  id: string;
  user_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_duration?: number;
  song_cover_url?: string;
  added_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private supabase = inject(SupabaseService);
  
  private favoritesSubject = new BehaviorSubject<FavoriteSong[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  
  private favoriteIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  public favoriteIds$ = this.favoriteIdsSubject.asObservable();

  constructor() {
    this.loadUserFavorites();
  }

  async loadUserFavorites(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      const { data, error } = await this.supabase.client
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error loading favorites:', error);
        return;
      }

      this.favoritesSubject.next(data || []);
      const favoriteIds = new Set((data || []).map(fav => fav.song_id));
      this.favoriteIdsSubject.next(favoriteIds);
    } catch (error) {
      console.error('Error in loadUserFavorites:', error);
    }
  }

  async addToFavorites(song: {
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

      const { data, error } = await this.supabase.client
        .from('user_favorites')
        .insert({
          user_id: user.id,
          song_id: song.id,
          song_title: song.title,
          song_artist: song.artist,
          song_duration: song.duration,
          song_cover_url: song.cover
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to favorites:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el estado local
      const currentFavorites = this.favoritesSubject.value;
      this.favoritesSubject.next([data, ...currentFavorites]);
      
      const currentIds = this.favoriteIdsSubject.value;
      currentIds.add(song.id);
      this.favoriteIdsSubject.next(new Set(currentIds));

      return { success: true };
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async removeFromFavorites(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { error } = await this.supabase.client
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId);

      if (error) {
        console.error('Error removing from favorites:', error);
        return { success: false, error: error.message };
      }

      // Actualizar el estado local
      const currentFavorites = this.favoritesSubject.value;
      this.favoritesSubject.next(currentFavorites.filter(fav => fav.song_id !== songId));
      
      const currentIds = this.favoriteIdsSubject.value;
      currentIds.delete(songId);
      this.favoriteIdsSubject.next(new Set(currentIds));

      return { success: true };
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  isFavorite(songId: string): boolean {
    return this.favoriteIdsSubject.value.has(songId);
  }

  getFavorites(): Observable<FavoriteSong[]> {
    return this.favorites$;
  }

  async toggleFavorite(song: {
    id: string;
    title: string;
    artist: string;
    duration?: number;
    cover?: string;
  }): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
    const isFav = this.isFavorite(song.id);
    
    if (isFav) {
      const result = await this.removeFromFavorites(song.id);
      return { ...result, isFavorite: false };
    } else {
      const result = await this.addToFavorites(song);
      return { ...result, isFavorite: true };
    }
  }
}