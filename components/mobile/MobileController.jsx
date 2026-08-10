// components/mobile/MobileController.jsx
import { useState, useEffect } from 'react';
import Phase1Category from './Phase1Category';
import Phase2Submit from './Phase2Submit';
import Phase3Matching from './Phase3Matching';
import Phase4Trivia from './Phase4Trivia';
import Phase5StoryTime from './Phase5StoryTime';
import Phase6Recap from './Phase6Recap';

// Array matching your exact public folder background assets
const BACKGROUND_IMAGES = [
  '/bg-backstage.jpg',
  '/bg-stage-pov.jpg',
  '/bg-amps.jpg',
  '/bg-soundboard.jpg'
];

export default function MobileController({ roomState, socket }) {
  const [bgIndex, setBgIndex] = useState(0);
  const status = roomState?.status || 'LOBBY';
  const player = (roomState?.players || []).find((p) => p.id === socket?.id);

  // Rotate background every 15 seconds to match the host screen vibe
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.6)), url(${BACKGROUND_IMAGES[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '12px', 
        boxSizing: 'border-box',
        transition: 'background-image 1s ease-in-out'
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#383A42', border: '3px solid #595747', boxShadow: '6px 6px 0px 0px #64452D', padding: '20px', boxSizing: 'border-box', minHeight: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* LOBBY WAIT SCREEN */}
        {status === 'LOBBY' && (
          <div style={{ textAlign: 'center', margin: 'auto 0' }}>
            {/* Custom Mic Icon */}
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              <img src="/mic.png" alt="Tour Mic" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>

            <div style={{ backgroundColor: '#595747', border: '2px solid #64452D', padding: '12px', marginBottom: '16px', boxShadow: '3px 3px 0px 0px #AE8781' }}>
              <h1 style={{ color: '#F4F3EE', fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                WELCOME TO THE BAND!
              </h1>
            </div>
            
            <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {player?.avatar?.image ? (
                <img 
                  src={player.avatar.image} 
                  alt={player.avatar.name || 'Avatar'} 
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
                />
              ) : (
                <span style={{ fontSize: '24px' }}>{player?.avatar?.icon || '🎸'}</span>
              )}
              <p style={{ color: '#AE8781', fontSize: '18px', fontWeight: '900', margin: 0 }}>
                {player?.name}
              </p>
            </div>

            <p style={{ color: '#D1D0C5', fontSize: '13px', fontWeight: '700', lineHeight: '1.4' }}>
              Look at the main TV screen! The show starts once everyone joins.
            </p>
          </div>
        )}

        {status === 'CATEGORY_PICK' && (
          <Phase1Category roomCode={roomState.roomCode} socket={socket} roomState={roomState} />
        )}

        {status === 'SONG_SUBMIT' && (
          <Phase2Submit roomCode={roomState.roomCode} socket={socket} roomState={roomState} />
        )}

        {status === 'MATCHING' && (
          <Phase3Matching roomCode={roomState.roomCode} socket={socket} roomState={roomState} />
        )}

        {status === 'TRIVIA_TIME' && (
          <Phase4Trivia roomCode={roomState.roomCode} socket={socket} roomState={roomState} />
        )}

        {status === 'STORY_TIME' && (
          <Phase5StoryTime roomCode={roomState.roomCode} socket={socket} roomState={roomState} />
        )}

        {status === 'SCORE_RECAP' && (
          <Phase6Recap roomState={roomState} />
        )}

      </div>
    </div>
  );
}