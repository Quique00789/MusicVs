// src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    // 🔑 COLOCA AQUÍ TU SUPABASE_URL
    // Ejemplo: 'https://xyzcompany.supabase.co'
    url: 'https://fkuejxvbhtjfmjnhoigu.supabase.co',
    
    // 🔑 COLOCA AQUÍ TU SUPABASE_ANON_KEY
    // Ejemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdWVqeHZiaHRqZm1qbmhvaWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzYyNzAsImV4cCI6MjA3NjE1MjI3MH0.1w3nn4B0-LCjDalK0YxtjKqZ6EAMvii4inBNnwhdOd0',
    
    // 📁 Nombre del bucket donde están las canciones en Supabase Storage
    // Por defecto: 'songs' (ajusta según tu bucket)
    storageBucket: 'songs'
  }
};

