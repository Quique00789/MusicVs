import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DiscoverItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'song' | 'artist' | 'playlist' | 'genre';
  duration?: string;
  plays?: string;
}

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,