import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';
import { songs } from './data/songs';

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songs: Song[];
  createdAt: string;
  duration: string;
  isPublic: boolean;
}

interface QueueItem extends Song {
  queuePosition: number;
  isCurrentlyPlaying: boolean;
}

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="playlists-container"> ... (TRUNCATED FOR REPLY LENGTH) ... 
  trackBySong(index: number, song: QueueItem): string {
    return song.id;
  }
}
