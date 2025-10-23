// src/app/services/supabase.service.ts
import { Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private ngZone: NgZone) {
    // Initialize Supabase client outside Angular zone to prevent infinite loading
    this.supabase = this.ngZone.runOutsideAngular(() => 
      createClient(
        environment.supabase.url,
        environment.supabase.anonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Disabled to prevent issues
            flowType: 'implicit' // Changed from PKCE to implicit for simplicity
          }
        }
      )
    );
  }

  // Expose the raw Supabase client for low-level operations when needed
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper to get current user with proper error handling
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) {
        console.warn('Error getting current user:', error);
        return null;
      }
      return data?.user ?? null;
    } catch (e) {
      console.warn('Error getting current user:', e);
      return null;
    }
  }

  /* ----------------------- Authentication helpers ----------------------- */

  /** Sign up with email + password - NO EMAIL CONFIRMATION REQUIRED */
  async signUpWithEmail(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password
        // Removed emailRedirectTo to disable email confirmation
      });
      
      if (error) {
        console.error('SignUp error:', error);
        throw error;
      }
      
      console.log('SignUp successful:', { 
        user: data.user?.id, 
        email: data.user?.email,
        session: !!data.session
      });
      
      return data;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  /** Sign in with email + password */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('SignIn error:', error);
        throw error;
      }
      
      console.log('SignIn successful:', { 
        user: data.user?.id, 
        email: data.user?.email,
        session: !!data.session 
      });
      
      return data;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  }

  /** Sign in (redirect) with Google OAuth */
  async signInWithGoogle(redirectTo?: string) {
    try {
      const options: any = {
        redirectTo: redirectTo || window.location.origin
      };
      
      const { data, error } = await this.supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options 
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }

  /** Sign out with enhanced error handling and cleanup */
  async signOut() {
    try {
      console.log('Attempting to sign out from Supabase...');
      const { error } = await this.supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      console.log('Successfully signed out from Supabase');
      return true;
    } catch (error) {
      console.error('Error during signOut:', error);
      // Re-throw the error so calling code can handle it
      throw error;
    }
  }

  /** Get current session */
  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        console.warn('Error getting session:', error);
        return null;
      }
      return data.session;
    } catch (e) {
      console.warn('Error getting session:', e);
      return null;
    }
  }

  /** Refresh the current session */
  async refreshSession() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      if (error) {
        console.warn('Error refreshing session:', error);
        throw error;
      }
      return data;
    } catch (e) {
      console.warn('Error refreshing session:', e);
      throw e;
    }
  }

  /* ----------------------- Storage helpers ----------------------- */

  /**
   * Obtiene la URL pública de un archivo de audio en Supabase Storage
   * @param filePath - Ruta del archivo en el bucket (ej: 'songs/shape-of-you.mp3')
   * @returns URL pública del archivo
   */
  getPublicAudioUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(environment.supabase.storageBucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Obtiene una URL firmada (con tiempo de expiración) para archivos privados
   * @param filePath - Ruta del archivo en el bucket
   * @param expiresIn - Tiempo de expiración en segundos (por defecto 3600 = 1 hora)
   * @returns Promise con la URL firmada
   */
  async getSignedAudioUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(environment.supabase.storageBucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Lista todos los archivos en el bucket
   * @param folder - Carpeta dentro del bucket (opcional)
   * @returns Promise con la lista de archivos
   */
  async listAudioFiles(folder?: string) {
    const { data, error } = await this.supabase.storage
      .from(environment.supabase.storageBucket)
      .list(folder);

    if (error) {
      console.error('Error listing files:', error);
      throw error;
    }

    return data;
  }

  /**
   * Descarga un archivo de audio como Blob
   * @param filePath - Ruta del archivo en el bucket
   * @returns Promise con el Blob del archivo
   */
  async downloadAudioFile(filePath: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(environment.supabase.storageBucket)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      throw error;
    }

    return data;
  }

  /**
   * Verifica si un archivo existe en el storage
   * @param filePath - Ruta del archivo
   * @returns Promise<boolean>
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(environment.supabase.storageBucket)
        .list(filePath.substring(0, filePath.lastIndexOf('/')));

      if (error) return false;
      
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
      return data?.some(file => file.name === fileName) ?? false;
    } catch {
      return false;
    }
  }
}