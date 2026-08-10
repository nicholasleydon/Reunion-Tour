// components/mobile/Phase1Category.jsx
import { useState } from 'react';

const DEFAULT_PROMPTS = [
  { id: '1', title: 'Nostalgia', description: 'A song that instantly takes you back to high school or college.' },
  { id: '2', title: 'Guilty Pleasure', description: 'A track you secretly love but might not blast with windows down.' },
  { id: '3', title: 'Road Trip Jam', description: 'The ultimate song for driving down an open highway.' },
  { id: '4', title: 'Late Night Vibes', description: 'A track perfect for 2 AM wind-downs or deep conversations.' },
  { id: '5', title: 'Hype Song', description: 'The track that gets you pumped up before a big workout.' }
];

export default function Phase1Category({ roomCode, socket, roomState }) {
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const promptGiver = (roomState?.players || []).find((p) => p.id === currentRound.activePlayerId);

  const handleSelectPrompt = (promptObj) => {
    socket.emit('player:pickCategory', { roomCode, category: promptObj });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const customObj = {
      title: customTitle.trim(),
      description: customDesc.trim() || 'Custom Prompt'
    };

    socket.emit('player:pickCategory', { roomCode, category: customObj });
  };

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <img src="/promptidea.png" alt="Setting Vibe" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>
        <div style={{ backgroundColor: '#27272A', border: '2px solid #52525B', padding: '12px', marginBottom: '16px' }}>
          <h2 style={{ color: '#F59E0B', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
            SETTING THE VIBE
          </h2>
        </div>
        <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px' }}>
          {promptGiver?.avatar?.icon} <span style={{ color: '#F59E0B' }}>{promptGiver?.name}</span> is picking the setlist prompt on their phone!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #3F3F46', paddingBottom: '8px' }}>
        <span style={{ backgroundColor: '#F59E0B', color: '#000000', fontWeight: '900', fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase' }}>
          YOUR TURN
        </span>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: '4px 0 0 0' }}>
          PICK A CATEGORY
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
        {DEFAULT_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handleSelectPrompt(prompt)}
            style={{
              backgroundColor: '#000000',
              border: '2px solid #3F3F46',
              padding: '10px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px 0px #B91C1C'
            }}
          >
            <h3 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{prompt.title}</h3>
            <p style={{ color: '#A1A1AA', fontSize: '11px', fontWeight: '700', margin: '2px 0 0 0' }}>{prompt.description}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomSubmit} style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>Or Custom Prompt</span>
        <input
          type="text"
          placeholder="Prompt Title"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', backgroundColor: '#18181B', border: '1px solid #3F3F46', color: '#FFFFFF', fontSize: '13px', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          style={{ backgroundColor: '#B91C1C', color: '#FFFFFF', fontWeight: '900', fontSize: '13px', padding: '10px', border: '1px solid #000000', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>Submit Custom</span>
          <img src="/promptidea.png" alt="Idea" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
        </button>
      </form>
    </div>
  );
}