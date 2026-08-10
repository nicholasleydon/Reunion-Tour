// components/mobile/Phase2Submit.jsx
import { useState } from 'react';

export default function Phase2Submit({ roomCode, socket, roomState }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState(null);

  const currentRound = roomState?.currentRound || {};
  const categoryData = typeof currentRound.category === 'object'
    ? currentRound.category
    : { title: currentRound.category || 'Music', description: '' };

  const isPromptGiver = currentRound.activePlayerId === socket?.id;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=6`
      );
      const data = await res.json();

      const formatted = (data.results || []).map((track) => ({
        id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        releaseDate: track.releaseDate,
        cover: track.artworkUrl100?.replace('100x100', '300x300'),
        previewUrl: track.previewUrl
      }));

      setSearchResults(formatted);
    } catch (err) {
      console.error('iTunes search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTogglePreview = (songId) => {
    setPlayingPreviewId(playingPreviewId === songId ? null : songId);
  };

  const handleSubmit = (song) => {
    setSelectedSong(song);
    socket.emit('player:submitSong', { roomCode, song });
    setHasSubmitted(true);
  };

  if (isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>👑</div>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>PROMPT GIVER</h2>
        <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px', margin: '12px 0' }}>
          <p style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '900', margin: 0 }}>{categoryData.title}</p>
        </div>
        <p style={{ color: '#A1A1AA', fontSize: '13px' }}>Band members are locking in their tracks...</p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>TRACK LOCKED IN!</h2>
        <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px', margin: '12px 0', textAlign: 'left' }}>
          <p style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '900', margin: 0 }}>{selectedSong?.title}</p>
          <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '4px 0 0 0' }}>{selectedSong?.artist}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '10px' }}>
        <span style={{ color: '#B91C1C', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>PROMPT</span>
        <h2 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{categoryData.title}</h2>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          placeholder="Search track or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', backgroundColor: '#000000', border: '2px solid #3F3F46', color: '#FFFFFF', fontSize: '14px' }}
        />
        <button type="submit" style={{ backgroundColor: '#B91C1C', color: '#FFFFFF', fontWeight: '900', padding: '0 16px', border: 'none', cursor: 'pointer' }}>
          {isSearching ? '...' : '🔍'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
        {searchResults.map((song) => {
          const isPlaying = playingPreviewId === song.id;

          return (
            <div key={song.id} style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {song.cover && <img src={song.cover} alt="Cover" style={{ width: '56px', height: '56px', objectFit: 'cover', border: '1px solid #3F3F46' }} />}
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <h3 style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</h3>
                  <p style={{ color: '#A1A1AA', fontSize: '11px', fontWeight: '700', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {song.previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(song.id)}
                    style={{ flex: 1, backgroundColor: '#27272A', color: '#F59E0B', border: '1px solid #52525B', fontSize: '11px', fontWeight: '900', padding: '8px', cursor: 'pointer' }}
                  >
                    {isPlaying ? '⏸️ PAUSE' : '▶️ PREVIEW'}
                  </button>
                )}
                {isPlaying && <audio autoPlay src={song.previewUrl} onEnded={() => setPlayingPreviewId(null)} className="hidden" />}
                <button
                  onClick={() => handleSubmit(song)}
                  style={{ flex: 1, backgroundColor: '#B91C1C', color: '#FFFFFF', border: 'none', fontSize: '11px', fontWeight: '900', padding: '8px', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  PICK TRACK 🚀
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}