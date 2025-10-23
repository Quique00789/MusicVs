export interface SocialLink {
  platform: 'instagram' | 'youtube' | 'spotify' | 'soundcloud' | 'twitter' | 'facebook';
  url: string;
  displayName?: string;
}

export interface Artist {
  id: string;
  name: string;
  realName?: string;
  bio: string;
  shortBio: string;
  profileImage?: string;
  coverImage?: string;
  genres: string[];
  country: string;
  socialLinks: SocialLink[];
  songCount: number;
  verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistWithSongs extends Artist {
  songs: any[]; // Referencias a las canciones del artista
}