import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-slate-900 text-white">
      <div class="w-full max-w-md p-8 bg-black/60 rounded-lg border border-white/5 text-center">
        <div *ngIf="isProcessing" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <h2 class="text-xl font-bold">Procesando autenticación...</h2>
          <p class="text-gray-400">Por favor espera mientras confirmamos tu cuenta.</p>
        </div>

        <div *ngIf="isSuccess" class="space-y-4">
          <div class="w-12 h-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          </div>
          <h2 class="text-xl font-bold text-green-400">¡Cuenta confirmada!</h2>
          <p class="text-gray-400">Tu correo ha sido verificado exitosamente. Redirigiendo...</p>
        </div>

        <div *ngIf="isError" class="space-y-4">
          <div class="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
          </div>
          <h2 class="text-xl font-bold text-red-400">Error de confirmación</h2>
          <p class="text-gray-400">{{ errorMessage }}</p>
          <button 
            (click)="goToAuth()" 
            class="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-colors">
            Volver al login
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  isProcessing = true;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    try {
      // Get the URL fragment or query parameters
      const fragment = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log('Auth callback - Fragment:', fragment);
      console.log('Auth callback - Search params:', window.location.search);
      
      // Check for error in URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('Auth callback error:', error, errorDescription);
        this.handleError(errorDescription || error);
        return;
      }
      
      // Process the authentication callback
      if (fragment || searchParams.get('code')) {
        await this.processAuthCallback();
      } else {
        // No auth parameters found, redirect to auth page
        console.log('No auth parameters found, redirecting to auth');
        this.router.navigate(['/auth']);
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      this.handleError('Error procesando la confirmación de la cuenta.');
    }
  }

  private async processAuthCallback() {
    try {
      // Let Supabase handle the callback automatically
      // The session should be set automatically by Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      
      // Check if user is now authenticated
      const session = await this.supabase.getSession();
      const user = await this.supabase.getCurrentUser();
      
      console.log('Auth callback - Session:', !!session);
      console.log('Auth callback - User:', user?.id, user?.email_confirmed_at);
      
      if (session && user) {
        this.isProcessing = false;
        this.isSuccess = true;
        
        // Redirect to home after showing success message
        setTimeout(() => {
          this.router.navigate(['/'], { replaceUrl: true });
        }, 2000);
      } else {
        console.warn('No session or user found after callback processing');
        this.handleError('No se pudo completar la autenticación.');
      }
    } catch (error) {
      console.error('Error processing auth callback:', error);
      this.handleError('Error procesando la confirmación.');
    }
  }

  private handleError(message: string) {
    this.isProcessing = false;
    this.isError = true;
    this.errorMessage = message;
  }

  goToAuth() {
    this.router.navigate(['/auth']);
  }
}