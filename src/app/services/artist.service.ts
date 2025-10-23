import { Injectable } from '@angular/core';
import { Artist } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private artists: Artist[] = [
    {
      id: 'dj-valls-001',
      name: 'DJ Valls',
      realName: 'Miguel',
      bio: `Hi everyone :D !! I'm DJ Valls, a music producer from Mexico. My real name is Miguel, and I specialize in Hands Up, Happy Hardcore, Techno Trance, and occasionally Hardstyle. I mostly focus on creating remixes, so if you have any requests, feel free to let me know!

My passion for electronic music started when I was a child. I'd listen to artists like DJ Mangoo, DJ Harmonics, DJ Splash, and Atomika while playing, studying, or traveling. Their melodies and the emotions they evoked left a lasting impression on me, and I've always dreamed of creating music that gives others the same unforgettable feelings.

A few years ago, I decided to turn that dream into reality by producing my own songs. My goal is to make music that not only gets people moving but also stays with them-music that becomes part of their lives, just like those artists did for me. I see this as my way of giving back and inspiring others through sound.

Along the way, I've grown a lot as a producer, met incredible people, and learned so much. I hope to one day collaborate with the artists I admire, but I know I still have a long way to go. No matter what happens, I'll keep making music and pushing myself to create something meaningful for everyone.

Thank you for being part of my journey ;D.`,
      shortBio: 'Electronic music producer from Mexico specializing in Hands Up, Happy Hardcore, Techno Trance, and Hardstyle. Creating unforgettable remixes and original tracks.',
      profileImage: '', // Se puede agregar una URL de imagen más tarde
      genres: ['Hands Up', 'Happy Hardcore', 'Techno Trance', 'Hardstyle'],
      country: 'Mexico',
      socialLinks: [
        {
          platform: 'instagram',
          url: 'https://www.instagram.com/djvalls/',
          displayName: '@djvalls'
        },
        {
          platform: 'youtube',
          url: 'https://www.youtube.com/c/DJValls',
          displayName: 'DJ Valls'
        },
        {
          platform: 'spotify',
          url: 'https://open.spotify.com/intl-es/artist/4ey2pZ1akrhFCn6tM1LMq7?si=58Oq6FcPSsi-0KATaUQf7A',
          displayName: 'DJ Valls'
        },
        {
          platform: 'soundcloud',
          url: 'https://soundcloud.com/djvalls',
          displayName: 'djvalls'
        }
      ],
      songCount: 12, // Se puede actualizar según las canciones reales
      verified: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date()
    }
  ];

  constructor() { }

  getAllArtists(): Artist[] {
    return this.artists;
  }

  getArtistById(id: string): Artist | undefined {
    return this.artists.find(artist => artist.id === id);
  }

  getArtistByName(name: string): Artist | undefined {
    return this.artists.find(artist => 
      artist.name.toLowerCase() === name.toLowerCase() ||
      artist.realName?.toLowerCase() === name.toLowerCase()
    );
  }

  addArtist(artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>): Artist {
    const newArtist: Artist = {
      ...artist,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.artists.push(newArtist);
    return newArtist;
  }

  updateArtist(id: string, updates: Partial<Artist>): Artist | null {
    const index = this.artists.findIndex(artist => artist.id === id);
    if (index === -1) return null;
    
    this.artists[index] = {
      ...this.artists[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    return this.artists[index];
  }

  deleteArtist(id: string): boolean {
    const index = this.artists.findIndex(artist => artist.id === id);
    if (index === -1) return false;
    
    this.artists.splice(index, 1);
    return true;
  }

  searchArtists(query: string): Artist[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.artists;
    
    return this.artists.filter(artist => 
      artist.name.toLowerCase().includes(searchTerm) ||
      artist.realName?.toLowerCase().includes(searchTerm) ||
      artist.bio.toLowerCase().includes(searchTerm) ||
      artist.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
      artist.country.toLowerCase().includes(searchTerm)
    );
  }

  getArtistsByGenre(genre: string): Artist[] {
    return this.artists.filter(artist => 
      artist.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  private generateId(): string {
    return 'artist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}