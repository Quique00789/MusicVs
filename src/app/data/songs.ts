// src/app/data/songs.ts
import { Song } from '../models/song';

export const songs: Song[] = [
  {
    id: '1',
    title: 'Demo',
    artist: 'DJ Valls',
    cover: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg',
    album: 'Demo album',
    duration: '1:06',
    audioPath: 'Demo.mp3',
    requiresSignedUrl: false
  },
  {
    id: '2',
    title: 'Demo2',
    artist: 'DJ Valls',
    cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    album: 'Demo album',
    duration: '1:07',
    audioPath: 'Demo2.mp3',
    requiresSignedUrl: false
  },
  {
    id: '3',
    title: 'Demo3',
    artist: 'DJ Valls',
    cover: 'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg',
    album: 'Demo album',
    duration: '1:05',
    audioPath: 'Demo3.mp3',
    requiresSignedUrl: false
  }
];

/* 
  📝 NOTAS IMPORTANTES:
  
  1. audioPath debe coincidir con la ruta exacta en tu bucket de Supabase Storage
  
  2. Si tus archivos están en carpetas, incluye la ruta completa:
     audioPath: 'music/2024/song.mp3'
     
  3. Si tu bucket es PÚBLICO:
     - requiresSignedUrl: false
     - Los archivos se cargarán más rápido
     
  4. Si tu bucket es PRIVADO:
     - requiresSignedUrl: true
     - Se generarán URLs firmadas con tiempo de expiración
     
  5. Estructura recomendada en Supabase Storage:
     songs/
       ├── shape-of-you.mp3
       ├── blinding-lights.mp3
       └── levitating.mp3
*/