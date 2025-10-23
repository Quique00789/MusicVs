import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from '../models/song';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'mv:favorites';
  private favoritesSubject = new BehaviorSubject<Song[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadFavorites();
  }

  get favorites$(): Observable<Song[]> {
    return this.favoritesSubject.asObservable();
  }

  get favorites(): Song[] {
    return this.favoritesSubject.value;
  }

  private loadFavorites(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored) as Song[];
        this.favoritesSubject.next(favorites);
        console.log('Favorites loaded:', favorites.length, 'songs');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.saveFavorites([]);
    }
  }

  private saveFavorites(favorites: Song[]): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      console.log('Favorites saved:', favorites.length, 'songs');
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  isFavorite(songId: string): boolean {
    return this.favorites.some(song => song.id === songId);
  }

  toggle(song: Song): boolean {
    const currentFavorites = this.favorites;
    const index = currentFavorites.findIndex(fav => fav.id === song.id);
    
    let newFavorites: Song[];
    let isNowFavorite: boolean;

    if (index >= 0) {
      // Remove from favorites
      newFavorites = currentFavorites.filter(fav => fav.id !== song.id);
      isNowFavorite = false;
      console.log('Removed from favorites:', song.title);
    } else {
      // Add to favorites
      newFavorites = [...currentFavorites, song];
      isNowFavorite = true;
      console.log('Added to favorites:', song.title);
    }

    this.favoritesSubject.next(newFavorites);
    this.saveFavorites(newFavorites);
    
    return isNowFavorite;
  }

  addToFavorites(song: Song): void {
    if (!this.isFavorite(song.id)) {
      const newFavorites = [...this.favorites, song];
      this.favoritesSubject.next(newFavorites);
      this.saveFavorites(newFavorites);
      console.log('Added to favorites:', song.title);
    }
  }

  removeFromFavorites(songId: string): void {
    const newFavorites = this.favorites.filter(song => song.id !== songId);
    this.favoritesSubject.next(newFavorites);
    this.saveFavorites(newFavorites);
    console.log('Removed from favorites:', songId);
  }

  getFavorites(): Song[] {
    return this.favorites;
  }

  clearFavorites(): void {
    this.favoritesSubject.next([]);
    this.saveFavorites([]);
    console.log('All favorites cleared');
  }

  getFavoritesByArtist(artist: string): Song[] {
    return this.favorites.filter(song => 
      song.artist.toLowerCase().includes(artist.toLowerCase())
    );
  }

  getFavoritesByGenre(genre: string): Song[] {
    return this.favorites.filter(song => 
      song.genre?.toLowerCase().includes(genre.toLowerCase())
    );
  }

  getFavoritesCount(): number {
    return this.favorites.length;
  }
}