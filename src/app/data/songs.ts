// src/app/data/songs.ts
import { Song } from '../models/song';

export const songs: Song[] = [
  {
    id: '1',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    cover: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg',
    album: '÷ (Divide)',
    duration: '3:53',
    
    // 📁 AJUSTA estas rutas según la estructura de tu bucket en Supabase
    // Ejemplo: si tu archivo está en: bucket 'songs' -> carpeta 'music' -> 'shape-of-you.mp3'
    // Entonces: audioPath: 'music/shape-of-you.mp3'
    audioPath: 'Demo.mp3', // Cambia según tu estructura
    
    requiresSignedUrl: false // false = URL pública, true = URL firmada
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    album: 'After Hours',
    duration: '3:20',
    audioPath: 'Demo2.mp3', // 📁 Ajusta según tu bucket
    requiresSignedUrl: false
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    cover: 'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg',
    album: 'Future Nostalgia',
    duration: '3:23',
    audioPath: 'Demo3.mp3', // 📁 Ajusta según tu bucket
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