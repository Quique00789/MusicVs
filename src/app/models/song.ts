// src/app/models/song.ts
export interface Song {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  album?: string;
  duration?: string;
  
  // 📁 Nueva propiedad: ruta del archivo de audio en Supabase Storage
  // Ejemplo: 'songs/shape-of-you.mp3' o 'music/2024/blinding-lights.mp3'
  audioPath: string;
  
  // 🔒 Opcional: indica si el archivo requiere URL firmada (archivo privado)
  // Por defecto: false (URL pública)
  requiresSignedUrl?: boolean;
}