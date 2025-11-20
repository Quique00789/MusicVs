import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserPlaylistsService, UserPlaylist, PlaylistSong } from './services/user-playlists.service';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
  styles: [`...`]
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  playlistId: string | null = null;
  playlist: UserPlaylist | null = null;
  songs: PlaylistSong[] = [];
  isLoading = true;
  
  // Drag and drop
  draggedSong: PlaylistSong | null = null;
  draggedIndex: number = -1;

  // Edit modal
  showEditModal = false;
  editName = '';
  editDescription = '';
  editIsPublic = false;
  isSaving = false;

  // Delete modals
  showDeleteModal = false;
  isDeleting = false;
  showRemoveSongModal = false;
  songToRemove: PlaylistSong | null = null;
  isRemoving = false;

  // Player state
  currentPlayingSongId: string | null = null;

  // Toast
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  defaultCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private playlistsService: UserPlaylistsService,
    private authStateService: AuthStateService
  ) {}

  // ... resto de los métodos sin cambios ...

  // Player actions (versión original SIN AudioPlayerService)
  playSong(song: PlaylistSong) {
    this.currentPlayingSongId = song.song_id;
    this.showToast(`Reproduciendo "${song.song_title}"`, 'success');
    this.cdr.markForCheck();
  }

  playAll() {
    if (this.songs.length === 0) return;
    this.currentPlayingSongId = this.songs[0].song_id;
    this.showToast('Reproduciendo playlist', 'success');
    this.cdr.markForCheck();
  }

  // ... resto de los métodos sin cambios ...
}
