// src/app/app.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { PlayerHostComponent } from './player-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, PlayerHostComponent],
  template: `
    <app-header></app-header>
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>
    <app-player-host></app-player-host>
  `,
  styleUrls: ['./app.css']
})
export class App {}
