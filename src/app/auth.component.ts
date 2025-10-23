import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-slate-900 text-white">
      <div class="w-full max-w-md p-8 bg-black/60 rounded-lg border border-white/5">
        <h2 class="text-2xl font-bold mb-4">Iniciar sesión / Registrarse</h2>

        <div class="mb-6">
          <button 
            (click)="onGoogle()" 
            [disabled]="isLoading"
            class="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            <svg *ngIf="isGoogleLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span *ngIf="!isGoogleLoading">Continuar con Google</span>
            <span *ngIf="isGoogleLoading">Conectando...</span>
          </button>
        </div>

        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-black/60 text-gray-400">o</span>
          </div>
        </div>

        <form (ngSubmit)="onSubmit($event)">
          <div class="mb-4">
            <label class="block text-sm text-gray-300 mb-1">Correo electrónico</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              [disabled]="isLoading"
              class="w-full p-3 rounded bg-white/5 border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition-colors" 
              placeholder="tu@email.com"
              autocomplete="email"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm text-gray-300 mb-1">Contraseña</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              minlength="6"
              [disabled]="isLoading"
              class="w-full p-3 rounded bg-white/5 border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition-colors" 
              placeholder="Mínimo 6 caracteres"
              autocomplete="current-password"
            />
          </div>

          <div class="flex gap-2 mb-4">
            <button 
              type="button"
              (click)="onSignIn($event)" 
              [disabled]="isLoading || !isFormValid()"
              class="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors flex items-center justify-center gap-2">
              <svg *ngIf="isSignInLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSignInLoading ? 'Iniciando...' : 'Iniciar sesión' }}</span>
            </button>
            <button 
              type="button"
              (click)="onSignUp($event)" 
              [disabled]="isLoading || !isFormValid()"
              class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors flex items-center justify-center gap-2">
              <svg *ngIf="isSignUpLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSignUpLoading ? 'Registrando...' : 'Registrarse' }}</span>
            </button>
          </div>
        </form>

        <!-- Resend Confirmation Email Button -->
        <div *ngIf="showResendButton" class="mb-4">
          <button 
            (click)="onResendConfirmation()" 
            [disabled]="isResending"
            class="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors flex items-center justify-center gap-2">
            <svg *ngIf="isResending" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isResending ? 'Reenviando...' : 'Reenviar correo de confirmación' }}</span>
          </button>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Info Message -->
        <div *ngIf="infoMessage" class="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
            <span>{{ infoMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  email = '';
  password = '';
  error: string | null = null;
  successMessage: string | null = null;
  infoMessage: string | null = null;
  
  isLoading = false;
  isSignInLoading = false;
  isSignUpLoading = false;
  isGoogleLoading = false;
  isResending = false;
  
  showResendButton = false;
  pendingConfirmationEmail = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  isFormValid(): boolean {
    return this.email.length > 0 && 
           this.password.length >= 6 && 
           this.email.includes('@') &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  private clearMessages() {
    this.error = null;
    this.successMessage = null;
    this.infoMessage = null;
  }

  private resetLoadingStates() {
    this.isLoading = false;
    this.isSignInLoading = false;
    this.isSignUpLoading = false;
    this.isGoogleLoading = false;
    this.isResending = false;
    this.cdr.detectChanges();
  }

  private handleError(err: any): string {
    console.error('Auth error:', err);
    
    if (err.message) {
      // Handle specific Supabase errors
      if (err.message.includes('Invalid login credentials')) {
        return 'Credenciales inválidas. Verifica tu correo y contraseña.';
      }
      if (err.message.includes('Email not confirmed')) {
        this.showResendButton = true;
        this.pendingConfirmationEmail = this.email;
        return 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o reenvía el correo de confirmación.';
      }
      if (err.message.includes('User already registered')) {
        return 'Este correo ya está registrado. Intenta iniciar sesión en su lugar.';
      }
      if (err.message.includes('Password should be at least')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (err.message.includes('Unable to validate email address') || err.message.includes('Invalid email')) {
        return 'El formato del correo electrónico no es válido.';
      }
      if (err.message.includes('signup disabled')) {
        return 'El registro está temporalmente deshabilitado. Intenta más tarde.';
      }
      if (err.message.includes('email rate limit')) {
        return 'Has solicitado demasiados correos. Espera unos minutos antes de intentar nuevamente.';
      }
      return err.message;
    }
    
    return 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.';
  }

  async onGoogle() {
    this.clearMessages();
    this.isGoogleLoading = true;
    this.isLoading = true;
    
    try {
      const origin = window.location.origin;
      await this.supabase.signInWithGoogle(origin);
      // The page will redirect, so we don't need to handle success here
    } catch (e: any) {
      this.error = this.handleError(e);
      this.resetLoadingStates();
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    // This prevents the default form submission
  }

  async onSignIn(e: Event) {
    e.preventDefault();
    
    if (!this.isFormValid()) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    
    this.clearMessages();
    this.isSignInLoading = true;
    this.isLoading = true;
    this.showResendButton = false;
    
    try {
      const result = await this.supabase.signInWithEmail(this.email.trim(), this.password);
      
      if (result.user && result.session) {
        this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
        
        // Small delay to show success message
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      } else {
        this.error = 'No se pudo iniciar sesión. Intenta nuevamente.';
        this.resetLoadingStates();
      }
    } catch (err: any) {
      this.error = this.handleError(err);
      this.resetLoadingStates();
    }
  }

  async onSignUp(e: Event) {
    e.preventDefault();
    
    if (!this.isFormValid()) {
      this.error = 'Por favor completa todos los campos correctamente. El correo debe tener un formato válido y la contraseña mínimo 6 caracteres.';
      return;
    }
    
    this.clearMessages();
    this.isSignUpLoading = true;
    this.isLoading = true;
    this.showResendButton = false;
    
    try {
      console.log('Attempting to sign up with:', { email: this.email.trim() });
      
      const result = await this.supabase.signUpWithEmail(this.email.trim(), this.password);
      
      console.log('SignUp result:', {
        user: result.user?.id,
        email: result.user?.email,
        emailConfirmed: result.user?.email_confirmed_at,
        session: !!result.session
      });
      
      if (result.user) {
        if (result.user.email_confirmed_at) {
          // User is immediately confirmed (happens in development or if email confirmation is disabled)
          this.successMessage = '¡Registro exitoso! Tu cuenta ha sido activada. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          // User needs email confirmation
          this.successMessage = '¡Registro exitoso! Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada (incluye la carpeta de spam).';
          this.infoMessage = 'Una vez que confirmes tu correo, podrás iniciar sesión normalmente.';
          this.showResendButton = true;
          this.pendingConfirmationEmail = this.email.trim();
          this.resetLoadingStates();
        }
      } else {
        this.error = 'No se pudo crear la cuenta. Intenta nuevamente.';
        this.resetLoadingStates();
      }
    } catch (err: any) {
      console.error('SignUp error details:', err);
      this.error = this.handleError(err);
      this.resetLoadingStates();
    }
  }

  async onResendConfirmation() {
    if (!this.pendingConfirmationEmail) {
      this.error = 'No hay correo pendiente de confirmación.';
      return;
    }
    
    this.clearMessages();
    this.isResending = true;
    
    try {
      await this.supabase.resendConfirmationEmail(this.pendingConfirmationEmail);
      this.successMessage = 'Correo de confirmación reenviado exitosamente. Revisa tu bandeja de entrada.';
    } catch (err: any) {
      this.error = this.handleError(err);
    } finally {
      this.isResending = false;
      this.cdr.detectChanges();
    }
  }
}