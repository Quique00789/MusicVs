import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from '../models/song';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Song[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistsService {
  private readonly STORAGE_KEY = 'mv:playlists';
  private playlistsSubject = new BehaviorSubject<Playlist[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadPlaylists();
  }

  get playlists$(): Observable<Playlist[]> {
    return this.playlistsSubject.asObservable();
  }

  get playlists(): Playlist[] {
    return this.playlistsSubject.value;
  }

  private loadPlaylists(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const playlists = JSON.parse(stored) as Playlist[];
        // Convert date strings back to Date objects
        playlists.forEach(playlist => {
          playlist.createdAt = new Date(playlist.createdAt);
          playlist.updatedAt = new Date(playlist.updatedAt);
        });
        this.playlistsSubject.next(playlists);
        console.log('Playlists loaded:', playlists.length, 'playlists');
      } else {
        // Create default playlists for new users
        this.createDefaultPlaylists();
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
      this.createDefaultPlaylists();
    }
  }

  private createDefaultPlaylists(): void {
    const defaultPlaylists: Playlist[] = [
      {
        id: 'liked-songs',
        name: 'Canciones que me gustan',
        description: 'Tu música favorita en un solo lugar',
        tracks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recent',
        name: 'Reproducidas recientemente',
        description: 'Las últimas canciones que has escuchado',
        tracks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.playlistsSubject.next(defaultPlaylists);
    this.savePlaylists(defaultPlaylists);
  }

  private savePlaylists(playlists: Playlist[]): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlists));
      console.log('Playlists saved:', playlists.length, 'playlists');
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  createPlaylist(name: string, description?: string): Playlist {
    const newPlaylist: Playlist = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedPlaylists = [...this.playlists, newPlaylist];
    this.playlistsSubject.next(updatedPlaylists);
    this.savePlaylists(updatedPlaylists);
    
    console.log('Playlist created:', newPlaylist.name);
    return newPlaylist;
  }

  getPlaylist(id: string): Playlist | null {
    return this.playlists.find(playlist => playlist.id === id) || null;
  }

  updatePlaylist(id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt' | 'tracks'>>): boolean {
    const playlists = this.playlists;
    const index = playlists.findIndex(playlist => playlist.id === id);
    
    if (index >= 0) {
      playlists[index] = {
        ...playlists[index],
        ...updates,
        updatedAt: new Date()
      };
      
      this.playlistsSubject.next([...playlists]);
      this.savePlaylists(playlists);
      console.log('Playlist updated:', playlists[index].name);
      return true;
    }
    
    return false;
  }

  deletePlaylist(id: string): boolean {
    // Prevent deletion of default playlists
    if (id === 'liked-songs' || id === 'recent') {
      console.warn('Cannot delete default playlist:', id);
      return false;
    }

    const playlists = this.playlists;
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    
    if (updatedPlaylists.length !== playlists.length) {
      this.playlistsSubject.next(updatedPlaylists);
      this.savePlaylists(updatedPlaylists);
      console.log('Playlist deleted:', id);
      return true;
    }
    
    return false;
  }

  addSongToPlaylist(playlistId: string, song: Song): boolean {
    const playlists = this.playlists;
    const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
    
    if (playlistIndex >= 0) {
      const playlist = playlists[playlistIndex];
      
      // Check if song already exists
      if (!playlist.tracks.some(track => track.id === song.id)) {
        playlist.tracks.push(song);
        playlist.updatedAt = new Date();
        
        this.playlistsSubject.next([...playlists]);
        this.savePlaylists(playlists);
        console.log('Song added to playlist:', song.title, '→', playlist.name);
        return true;
      } else {
        console.log('Song already in playlist:', song.title);
        return false;
      }
    }
    
    return false;
  }

  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const playlists = this.playlists;
    const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
    
    if (playlistIndex >= 0) {
      const playlist = playlists[playlistIndex];
      const initialLength = playlist.tracks.length;
      
      playlist.tracks = playlist.tracks.filter(track => track.id !== songId);
      
      if (playlist.tracks.length !== initialLength) {
        playlist.updatedAt = new Date();
        
        this.playlistsSubject.next([...playlists]);
        this.savePlaylists(playlists);
        console.log('Song removed from playlist:', songId, 'from', playlist.name);
        return true;
      }
    }
    
    return false;
  }

  isSongInPlaylist(playlistId: string, songId: string): boolean {
    const playlist = this.getPlaylist(playlistId);
    return playlist ? playlist.tracks.some(track => track.id === songId) : false;
  }

  getPlaylistsContainingSong(songId: string): Playlist[] {
    return this.playlists.filter(playlist => 
      playlist.tracks.some(track => track.id === songId)
    );
  }

  private generateId(): string {
    return 'playlist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Utility methods
  getTotalTracks(): number {
    return this.playlists.reduce((total, playlist) => total + playlist.tracks.length, 0);
  }

  getPlaylistDuration(playlistId: string): number {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return 0;
    
    return playlist.tracks.reduce((total, track) => {
      // Assuming duration is in seconds, adjust if different
      return total + (track.duration || 0);
    }, 0);
  }
}