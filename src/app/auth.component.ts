import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './services/supabase.service';
import { AuthStateService } from './services/auth-state.service';
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
            <span>{{ isGoogleLoading ? 'Conectando...' : 'Continuar con Google' }}</span>
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

        <form (ngSubmit)="onSubmit($event)" #authForm="ngForm">
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
              (click)="onSignIn()" 
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
              (click)="onSignUp()" 
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
      </div>
    </div>
  `
})
export class AuthComponent {
  email = '';
  password = '';
  error: string | null = null;
  successMessage: string | null = null;
  
  isLoading = false;
  isSignInLoading = false;
  isSignUpLoading = false;
  isGoogleLoading = false;

  constructor(
    private supabase: SupabaseService,
    private authState: AuthStateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
  }

  private resetLoadingStates() {
    this.ngZone.run(() => {
      this.isLoading = false;
      this.isSignInLoading = false;
      this.isSignUpLoading = false;
      this.isGoogleLoading = false;
      this.cdr.detectChanges();
    });
  }

  private handleError(err: any): string {
    console.error('Auth error:', err);
    
    if (err.message) {
      // Handle specific Supabase errors
      if (err.message.includes('Invalid login credentials')) {
        return 'Credenciales inválidas. Verifica tu correo y contraseña.';
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

  async onSignIn() {
    if (this.isLoading || !this.isFormValid()) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    
    this.clearMessages();
    this.isSignInLoading = true;
    this.isLoading = true;
    
    try {
      console.log('Starting sign in process...');
      
      const result = await this.supabase.signInWithEmail(this.email.trim(), this.password);
      
      if (result.user && result.session) {
        console.log('Sign in successful, updating auth state...');
        
        // Force refresh auth state to update header immediately
        await this.authState.refreshUserState();
        
        this.ngZone.run(() => {
          this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
          this.cdr.detectChanges();
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          this.ngZone.run(() => {
            this.router.navigate(['/']);
          });
        }, 1000);
      } else {
        throw new Error('No se pudo iniciar sesión');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      this.ngZone.run(() => {
        this.error = this.handleError(err);
        this.resetLoadingStates();
      });
    }
  }

  async onSignUp() {
    if (this.isLoading || !this.isFormValid()) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    
    this.clearMessages();
    this.isSignUpLoading = true;
    this.isLoading = true;
    
    try {
      console.log('Starting sign up process...');
      
      const result = await this.supabase.signUpWithEmail(this.email.trim(), this.password);
      
      if (result.user) {
        console.log('Sign up successful, updating auth state...');
        
        // Force refresh auth state to update header immediately
        await this.authState.refreshUserState();
        
        this.ngZone.run(() => {
          this.successMessage = '¡Registro exitoso! Tu cuenta ha sido creada. Redirigiendo...';
          this.cdr.detectChanges();
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          this.ngZone.run(() => {
            this.router.navigate(['/']);
          });
        }, 1500);
      } else {
        throw new Error('No se pudo crear la cuenta');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      this.ngZone.run(() => {
        this.error = this.handleError(err);
        this.resetLoadingStates();
      });
    }
  }
}