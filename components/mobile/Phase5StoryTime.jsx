// components/mobile/Phase5StoryTime.jsx
import { useState } from 'react';

export default function Phase5StoryTime({ roomCode, socket, roomState }) {
  const [selectedBestPlayerId, setSelectedBestPlayerId] = useState('');

  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;

  const nonPromptPlayers = (roomState?.players || []).filter(
    (p) => p.id !== currentRound.activePlayerId
  );

  const handleAwardWinner = () => {
    socket.emit('player:awardBestStory', { roomCode, bestPlayerId: selectedBestPlayerId });
  };

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎤</div>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>STORYTELLERS</h2>
        <p style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '700', backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px', margin: '12px 0' }}>
          Behind The Music: Share the story behind your song choice with the room!
        </p>
        <p style={{ color: '#A1A1AA', fontSize: '12px' }}>The Headliner will award +100 bonus points to the best backstory!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #3F3F46', paddingBottom: '8px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>BEHIND THE MUSIC</h2>
        <p style={{ color: '#A1A1AA', fontSize: '11px', margin: '2px 0 0 0' }}>Award +100 bonus points for best backstory!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
        {nonPromptPlayers.map((p) => {
          const isSelected = selectedBestPlayerId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedBestPlayerId(p.id)}
              style={{
                padding: '12px',
                backgroundColor: isSelected ? '#F59E0B' : '#000000',
                color: isSelected ? '#000000' : '#FFFFFF',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid #3F3F46',
                fontWeight: '900',
                fontSize: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>{p.avatar?.icon} {p.name}</span>
              {isSelected && <span>👑 WINNER</span>}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAwardWinner}
        style={{ width: '100%', backgroundColor: '#B91C1C', color: '#FFFFFF', fontSize: '16px', fontWeight: '900', padding: '14px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F59E0B', cursor: 'pointer', marginTop: '8px' }}
      >
        Award Winner & See Standings 🏆
      </button>
    </div>
  );
}