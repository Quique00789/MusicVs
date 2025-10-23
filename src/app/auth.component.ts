import { Component } from '@angular/core';
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
            class="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
            />
          </div>

          <div class="flex gap-2 mb-4">
            <button 
              type="button"
              (click)="onSignIn($event)" 
              [disabled]="isLoading || !isFormValid()"
              class="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors">
              <span *ngIf="!isSignInLoading">Iniciar sesión</span>
              <span *ngIf="isSignInLoading">Iniciando...</span>
            </button>
            <button 
              type="button"
              (click)="onSignUp($event)" 
              [disabled]="isLoading || !isFormValid()"
              class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold transition-colors">
              <span *ngIf="!isSignUpLoading">Registrarse</span>
              <span *ngIf="isSignUpLoading">Registrando...</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
          {{ error }}
        </div>

        <!-- Loading Indicator -->
        <div *ngIf="isLoading" class="flex items-center justify-center mt-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
          <span class="ml-2 text-sm text-gray-400">Procesando...</span>
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
    private router: Router
  ) {}

  isFormValid(): boolean {
    return this.email.length > 0 && 
           this.password.length >= 6 && 
           this.email.includes('@');
  }

  private clearMessages() {
    this.error = null;
    this.successMessage = null;
  }

  private handleError(err: any): string {
    console.error('Auth error:', err);
    
    if (err.message) {
      // Handle specific Supabase errors
      if (err.message.includes('Invalid login credentials')) {
        return 'Credenciales inválidas. Verifica tu correo y contraseña.';
      }
      if (err.message.includes('Email not confirmed')) {
        return 'Por favor confirma tu correo electrónico antes de iniciar sesión.';
      }
      if (err.message.includes('User already registered')) {
        return 'Este correo ya está registrado. Intenta iniciar sesión.';
      }
      if (err.message.includes('Password should be at least')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (err.message.includes('Unable to validate email address')) {
        return 'Formato de correo electrónico inválido.';
      }
      return err.message;
    }
    
    return 'Ha ocurrido un error. Por favor intenta nuevamente.';
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
    } finally {
      this.isGoogleLoading = false;
      this.isLoading = false;
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
    
    try {
      const result = await this.supabase.signInWithEmail(this.email.trim(), this.password);
      
      if (result.user) {
        this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
        
        // Small delay to show success message
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    } catch (err: any) {
      this.error = this.handleError(err);
    } finally {
      this.isSignInLoading = false;
      this.isLoading = false;
    }
  }

  async onSignUp(e: Event) {
    e.preventDefault();
    
    if (!this.isFormValid()) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    
    this.clearMessages();
    this.isSignUpLoading = true;
    this.isLoading = true;
    
    try {
      const result = await this.supabase.signUpWithEmail(this.email.trim(), this.password);
      
      if (result.user) {
        if (result.user.email_confirmed_at) {
          this.successMessage = '¡Registro exitoso! Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        } else {
          this.successMessage = '¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.';
        }
      }
    } catch (err: any) {
      this.error = this.handleError(err);
    } finally {
      this.isSignUpLoading = false;
      this.isLoading = false;
    }
  }
}