import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { songs } from './data/songs';
import { Song } from './models/song';
import { SongCardComponent } from './song-card.component';
import { PlayerComponent } from './player.component';
import { HeroComponent } from './hero.component';
import { StickySectionComponent } from './sticky-section.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SongCardComponent, PlayerComponent, HeroComponent, StickySectionComponent],
  template: `
    <main class="pt-20">
      <app-hero></app-hero>

      <section class="py-20 bg-black">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-12" data-aos="fade-up">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-cyan-400">Trending Now</h2>
            <p class="text-lg text-gray-400">Discover the hottest tracks of the moment</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <song-card *ngFor="let song of songs; trackBy: trackByTitle" [song]="song" [isPlaying]="isPlaying() && currentSong()?.id===song.id" (play)="onPlay($event)"></song-card>
          </div>
        </div>

        <!-- Nota: el player global ya está en App root -->
      </section>

      <app-sticky-section title="Your Library" description="Access all your favorite music in one place. Create playlists, organize albums, and rediscover your collection with our intuitive library management system." imageUrl="https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=1200"></app-sticky-section>

      <app-sticky-section title="Curated Playlists" description="Explore expertly crafted playlists for every mood and moment. From workout sessions to late-night vibes, we've got the perfect soundtrack for you." imageUrl="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200" [reverse]="true"></app-sticky-section>

      <app-sticky-section title="High Quality Audio" description="Experience music the way it was meant to be heard. Stream in lossless quality and feel every beat, every note, every emotion with crystal-clear precision." imageUrl="https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg?auto=compress&cs=tinysrgb&w=1200"></app-sticky-section>
    </main>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  songs: Song[] = songs;

  currentSong: any;
  isPlaying: any;
  isLoading: any;
  progress: any;
  currentTime: any;
  duration: any;
  volume: any;

  constructor(private audioPlayerService: AudioPlayerService) {}

  ngOnInit() {
    this.currentSong = this.audioPlayerService.currentSong;
    this.isPlaying = this.audioPlayerService.isPlaying;
    this.isLoading = this.audioPlayerService.isLoading;
    this.progress = this.audioPlayerService.progress;
    this.currentTime = this.audioPlayerService.currentTime;
    this.duration = this.audioPlayerService.duration;
    this.volume = this.audioPlayerService.volume;
  }

  // Importante: no destruir el servicio global ni el audio al salir
  ngOnDestroy() {}

  async onPlay(song: Song) {
    const currentSong = this.currentSong();
    if (currentSong?.id === song.id) {
      this.togglePlay();
      return;
    }

    try {
      await this.audioPlayerService.playSong(song, song.audioPath, song.requiresSignedUrl || false);
      const index = this.songs.findIndex(s => s.id === song.id);
      if (index >= 0) this.audioPlayerService.currentIndex.set(index);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  }

  togglePlay() {
    const currentSong = this.currentSong();
    if (!currentSong) {
      this.onPlay(this.songs[0]);
      return;
    }
    this.audioPlayerService.togglePlay();
  }

  async next() {
    const currentIndex = this.audioPlayerService.currentIndex();
    const nextIndex = (currentIndex + 1) % this.songs.length;
    this.audioPlayerService.currentIndex.set(nextIndex);
    await this.onPlay(this.songs[nextIndex]);
  }

  async previous() {
    const currentIndex = this.audioPlayerService.currentIndex();
    const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length;
    this.audioPlayerService.currentIndex.set(prevIndex);
    await this.onPlay(this.songs[prevIndex]);
  }

  seek(percent: number) { this.audioPlayerService.seek(percent); }
  onSetVolume(v: number) { this.audioPlayerService.setVolume(v); }
  onSetPlaybackRate(r: number) { this.audioPlayerService.setPlaybackRate(r); }
  onToggleMute() { this.audioPlayerService.toggleMute(); }
  get formattedCurrentTime() { return this.audioPlayerService.formattedCurrentTime(); }
  playbackRate() { return this.audioPlayerService.playbackRate(); }
  trackByTitle(index: number, item: Song) { return item.id; }
}
