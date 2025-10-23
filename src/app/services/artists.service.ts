import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from '../models/song';
import { songs } from '../data/songs';

export interface Artist {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  genre?: string;
  followers?: number;
  monthlyListeners?: number;
  tracks: Song[];
  topTracks: Song[];
  albums: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private artistsSubject = new BehaviorSubject<Artist[]>([]);
  
  constructor() {
    this.generateArtists();
  }

  get artists$(): Observable<Artist[]> {
    return this.artistsSubject.asObservable();
  }

  get artists(): Artist[] {
    return this.artistsSubject.value;
  }

  private generateArtists(): void {
    // Get unique artists from songs
    const artistsMap = new Map<string, Artist>();

    // Add artists from existing songs
    songs.forEach(song => {
      const artistName = song.artist;
      if (!artistsMap.has(artistName)) {
        artistsMap.set(artistName, {
          id: this.generateArtistId(artistName),
          name: artistName,
          image: song.cover || this.getRandomArtistImage(),
          tracks: [],
          topTracks: [],
          albums: [],
          genre: this.getRandomGenre(),
          followers: this.getRandomFollowers(),
          monthlyListeners: this.getRandomListeners()
        });
      }
      
      const artist = artistsMap.get(artistName)!;
      artist.tracks.push(song);
      
      if (song.album && !artist.albums.includes(song.album)) {
        artist.albums.push(song.album);
      }
    });

    // Add some additional mock artists for demo
    const mockArtists = this.getMockArtists();
    mockArtists.forEach(mockArtist => {
      if (!artistsMap.has(mockArtist.name)) {
        artistsMap.set(mockArtist.name, mockArtist);
      }
    });

    // Set top tracks (first 5 tracks sorted by some criteria)
    artistsMap.forEach(artist => {
      artist.topTracks = artist.tracks.slice(0, 5);
    });

    const artistsArray = Array.from(artistsMap.values());
    this.artistsSubject.next(artistsArray);
    console.log('Artists generated:', artistsArray.length, 'artists');
  }

  private getMockArtists(): Artist[] {
    return [
      {
        id: 'the-weeknd',
        name: 'The Weeknd',
        image: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg',
        bio: 'The Weeknd es un cantante, compositor y productor canadiense conocido por su estilo único que combina R&B, pop y electrónica.',
        genre: 'R&B',
        followers: 45000000,
        monthlyListeners: 80000000,
        tracks: [],
        topTracks: [],
        albums: ['After Hours', 'Dawn FM', 'Beauty Behind the Madness']
      },
      {
        id: 'dua-lipa',
        name: 'Dua Lipa',
        image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
        bio: 'Dua Lipa es una cantante y compositora británica conocida por sus éxitos pop y su energética presencia escenica.',
        genre: 'Pop',
        followers: 35000000,
        monthlyListeners: 70000000,
        tracks: [],
        topTracks: [],
        albums: ['Future Nostalgia', 'Dua Lipa']
      },
      {
        id: 'bad-bunny',
        name: 'Bad Bunny',
        image: 'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg',
        bio: 'Bad Bunny es un rapero, cantante y compositor puertorriqueño que ha revolucionado el reggaetón y trap latino.',
        genre: 'Reggaeton',
        followers: 50000000,
        monthlyListeners: 90000000,
        tracks: [],
        topTracks: [],
        albums: ['Un Verano Sin Ti', 'X 100PRE', 'YHLQMDLG']
      },
      {
        id: 'billie-eilish',
        name: 'Billie Eilish',
        image: 'https://images.pexels.com/photos/2100341/pexels-photo-2100341.jpeg',
        bio: 'Billie Eilish es una cantante y compositora estadounidense conocida por su estilo único y su voz sussurrante.',
        genre: 'Alternative Pop',
        followers: 40000000,
        monthlyListeners: 75000000,
        tracks: [],
        topTracks: [],
        albums: ['When We All Fall Asleep', 'Happier Than Ever']
      },
      {
        id: 'ed-sheeran',
        name: 'Ed Sheeran',
        image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg',
        bio: 'Ed Sheeran es un cantautor británico conocido por sus baladas acústicas y pop pegajoso.',
        genre: 'Pop Folk',
        followers: 38000000,
        monthlyListeners: 68000000,
        tracks: [],
        topTracks: [],
        albums: ['÷ (Divide)', '× (Multiply)', '+ (Plus)']
      },
      {
        id: 'olivia-rodrigo',
        name: 'Olivia Rodrigo',
        image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg',
        bio: 'Olivia Rodrigo es una cantante y actriz estadounidense que saltó a la fama con sus emotivas canciones pop.',
        genre: 'Pop Rock',
        followers: 25000000,
        monthlyListeners: 55000000,
        tracks: [],
        topTracks: [],
        albums: ['SOUR', 'GUTS']
      }
    ];
  }

  getArtist(id: string): Artist | null {
    return this.artists.find(artist => artist.id === id) || null;
  }

  getArtistByName(name: string): Artist | null {
    return this.artists.find(artist => 
      artist.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  getTopArtists(limit: number = 10): Artist[] {
    return this.artists
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, limit);
  }

  getArtistsByGenre(genre: string): Artist[] {
    return this.artists.filter(artist => 
      artist.genre?.toLowerCase().includes(genre.toLowerCase())
    );
  }

  searchArtists(query: string): Artist[] {
    const searchTerm = query.toLowerCase();
    return this.artists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm) ||
      artist.genre?.toLowerCase().includes(searchTerm) ||
      artist.bio?.toLowerCase().includes(searchTerm)
    );
  }

  getArtistTracks(artistId: string): Song[] {
    const artist = this.getArtist(artistId);
    return artist ? artist.tracks : [];
  }

  getArtistTopTracks(artistId: string): Song[] {
    const artist = this.getArtist(artistId);
    return artist ? artist.topTracks : [];
  }

  getRelatedArtists(artistId: string): Artist[] {
    const artist = this.getArtist(artistId);
    if (!artist) return [];

    // Find artists with similar genre
    return this.artists
      .filter(a => 
        a.id !== artistId && 
        a.genre === artist.genre
      )
      .slice(0, 6);
  }

  private generateArtistId(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getRandomArtistImage(): string {
    const images = [
      'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg',
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg',
      'https://images.pexels.com/photos/2100341/pexels-photo-2100341.jpeg',
      'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg',
      'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  private getRandomGenre(): string {
    const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Indie', 'Alternative', 'Latin', 'Jazz', 'Classical'];
    return genres[Math.floor(Math.random() * genres.length)];
  }

  private getRandomFollowers(): number {
    return Math.floor(Math.random() * 50000000) + 1000000;
  }

  private getRandomListeners(): number {
    return Math.floor(Math.random() * 80000000) + 5000000;
  }

  // Utility methods
  getTotalArtists(): number {
    return this.artists.length;
  }

  getGenres(): string[] {
    const genres = new Set<string>();
    this.artists.forEach(artist => {
      if (artist.genre) {
        genres.add(artist.genre);
      }
    });
    return Array.from(genres).sort();
  }
}