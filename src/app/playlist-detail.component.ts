import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserPlaylistsService, UserPlaylist, PlaylistSong } from './services/user-playlists.service';
import { AuthStateService } from './services/auth-state.service';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
  styles: [`...`]
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  ...
  private audioPlayer = inject(AudioPlayerService);

  ...

  // Player actions actualizados
  playSong(song: PlaylistSong) {
    const queue = this.songs.map(s => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      duration: s.song_duration,
      cover: s.song_cover_url,
      audioPath: s.song_path,
      requiresSignedUrl: false // o true, según necesites
    }));
    const index = this.songs.findIndex(s => s.song_id === song.song_id);
    if (index !== -1) {
      this.audioPlayer.playTrack(queue[index], queue, index);
    }
    this.currentPlayingSongId = song.song_id;
    this.showToast(`Reproduciendo "${song.song_title}"`, 'success');
    this.cdr.markForCheck();
  }

  playAll() {
    if (this.songs.length === 0) return;
    const queue = this.songs.map(s => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      duration: s.song_duration,
      cover: s.song_cover_url,
      audioPath: s.song_path,
      requiresSignedUrl: false
    }));
    this.audioPlayer.playTrack(queue[0], queue, 0);
    this.currentPlayingSongId = this.songs[0].song_id;
    this.showToast('Reproduciendo playlist', 'success');
    this.cdr.markForCheck();
  }
  ...
}
