// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { PlayerHostComponent } from './player-host.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, PlayerHostComponent],
  template: `
    <app-header></app-header>

    <!-- Layout persistente: el router cambia el contenido pero NO desmonta el player -->
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>

    <!-- Player host con su propio botón interno; se eliminó el FAB global -->
    <app-player-host></app-player-host>
  `,
  styleUrls: ['./app.css']
})
export class App {
  constructor(public audio: AudioPlayerService) {}
}
