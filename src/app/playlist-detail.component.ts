// ...lógica y imports previos intactos...
// Reemplaza solo la parte de los métodos player

  // Player actions actualizados
  playSong(song: PlaylistSong) {
    const queue = this.songs.map(s => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      duration: s.song_duration,
      cover: s.song_cover_url,
      audioPath: s.song_audio_path || `audio/${s.song_id}.mp3`, // fix path correcto
      requiresSignedUrl: false
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
      audioPath: s.song_audio_path || `audio/${s.song_id}.mp3`, // fix path correcto
      requiresSignedUrl: false
    }));
    this.audioPlayer.playTrack(queue[0], queue, 0);
    this.currentPlayingSongId = this.songs[0].song_id;
    this.showToast('Reproduciendo playlist', 'success');
    this.cdr.markForCheck();
  }
// ...resto del componente igual...
