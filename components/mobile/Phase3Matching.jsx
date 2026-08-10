// components/mobile/Phase3Matching.jsx
import { useState } from 'react';

export default function Phase3Matching({ roomCode, socket, roomState }) {
  const [guesses, setGuesses] = useState({});

  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const submissions = Object.values(currentRound.submissions || {});

  let nonPromptPlayers = (roomState?.players || []).filter(
    (p) => p.id !== currentRound.activePlayerId
  );

  const hasDecoy = Object.values(currentRound.submissions || {}).some((s) => s.isDecoy);
  if (hasDecoy) {
    nonPromptPlayers = [
      ...nonPromptPlayers,
      { id: 'DECOY_BOT', name: '🎭 Decoy / House' }
    ];
  }

  // Enforce 1-to-1 matching: if targetPlayerId is already assigned elsewhere, unassign them first!
  const handleSelectMatch = (songId, targetPlayerId) => {
    setGuesses((prev) => {
      const updated = { ...prev };

      // Remove targetPlayerId if assigned to a different song
      Object.keys(updated).forEach((sId) => {
        if (updated[sId] === targetPlayerId) {
          delete updated[sId];
        }
      });

      updated[songId] = targetPlayerId;
      return updated;
    });
  };

  const handleSubmitGuesses = () => {
    socket.emit('player:submitGuess', { roomCode, guesses });
  };

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎧</div>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>LOOK AT THE TV!</h2>
        <p style={{ color: '#A1A1AA', fontSize: '13px' }}>The Headliner is matching tracks on the main screen...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #3F3F46', paddingBottom: '8px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>MATCH SONGS TO PLAYERS</h2>
        <p style={{ color: '#A1A1AA', fontSize: '11px', margin: '2px 0 0 0' }}>Assign 1 player per song!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
        {submissions.map((song) => (
          <div key={song.id} style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {song.cover && <img src={song.cover} alt="Cover" style={{ width: '56px', height: '56px', objectFit: 'cover', border: '1px solid #3F3F46' }} />}
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</h3>
                <p style={{ color: '#A1A1AA', fontSize: '12px', fontWeight: '700', margin: '2px 0 0 0' }}>{song.artist}</p>
              </div>
            </div>

            {/* Snippet Preview Player */}
            {song.previewUrl && (
              <audio controls src={song.previewUrl} style={{ width: '100%', height: '32px' }} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {nonPromptPlayers.map((p) => {
                const isSelected = guesses[song.id] === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectMatch(song.id, p.id)}
                    style={{
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: '900',
                      border: isSelected ? '2px solid #FFFFFF' : '1px solid #3F3F46',
                      backgroundColor: isSelected ? '#F59E0B' : '#18181B',
                      color: isSelected ? '#000000' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmitGuesses}
        style={{ width: '100%', backgroundColor: '#B91C1C', color: '#FFFFFF', fontSize: '16px', fontWeight: '900', padding: '12px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F59E0B', cursor: 'pointer' }}
      >
        Lock In Matches 🔒
      </button>
    </div>
  );
}