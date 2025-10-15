import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { songs } from './data/songs';
import { Song } from './models/song';
import { SongCardComponent } from './song-card.component';
import { PlayerComponent } from './player.component';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { StickySectionComponent } from './sticky-section.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SongCardComponent, PlayerComponent, HeaderComponent, HeroComponent, StickySectionComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  songs: Song[] = songs;

  currentSong: Song | null = null;
  currentIndex = 0;

  // Player state
  // Do NOT create `new Audio()` at initialization because this code may run on the server
  // (SSR) where the Audio API doesn't exist. Create lazily when needed and only if available.
  audio: HTMLAudioElement | null = null;
  isPlaying = false;
  progress = 0; // percent 0-100
  currentTime = 0; // seconds
  duration = 0; // seconds

  playSong(song: Song) {
    // In this demo we don't have real URLs; use a short beep generated via data URI or silence as placeholder
    this.currentSong = song;
    // Lazy-create audio only when running in a browser environment
    if (!this.audio && typeof Audio !== 'undefined') {
      this.audio = new Audio();
      // Wire up events if real audio is used later
      this.audio.addEventListener('timeupdate', () => {
        this.currentTime = this.audio ? this.audio.currentTime : this.currentTime;
        this.duration = this.audio ? (this.audio.duration || this.duration) : this.duration;
        this.progress = this.duration ? (this.currentTime / this.duration) * 100 : this.progress;
      });
      this.audio.addEventListener('loadedmetadata', () => {
        this.duration = this.audio ? (this.audio.duration || this.duration) : this.duration;
      });
    }

  // Reset/pretend values for the demo UI
  this.isPlaying = true;
    this.currentTime = 0;
    this.duration = 180; // pretend 3:00 duration (until real audio metadata arrives)
    this.progress = 0;
    // If you later add real audio URLs, call this.audio.src = url; this.audio.play(); etc.
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.audio) {
      if (this.isPlaying) this.audio.play().catch(() => {});
      else this.audio.pause();
    }
  }

  onPlay(song: Song) {
    if (this.currentSong?.id === song.id) {
      this.togglePlay();
    } else {
      this.playSong(song);
      const index = this.songs.findIndex(s => s.id === song.id);
      this.currentIndex = index >= 0 ? index : 0;
    }
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.songs.length;
    this.currentIndex = nextIndex;
    const s = this.songs[nextIndex];
    this.playSong(s);
  }

  previous() {
    const prevIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.currentIndex = prevIndex;
    const s = this.songs[prevIndex];
    this.playSong(s);
  }

  seek(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (event as MouseEvent).clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    this.progress = pct * 100;
    this.currentTime = pct * this.duration;
    if (this.audio && this.duration && !isNaN(this.duration)) {
      this.audio.currentTime = pct * this.duration;
    }
  }

  formatTime(sec: number) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  trackByTitle(index: number, item: any) {
    return item.title;
  }

  scrollToList() {
    const el = document.getElementById('songs');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
