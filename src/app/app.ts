// src/app/app.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="pt-20"><router-outlet></router-outlet></main>
  `,
  styleUrls: ['./app.css']
})
export class App {}