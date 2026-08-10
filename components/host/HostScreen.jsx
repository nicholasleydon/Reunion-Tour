// components/host/HostScreen.jsx
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { QRCodeSVG } from 'qrcode.react';
import ScoreboardMeter from './ScoreboardMeter';

const BACKGROUND_IMAGES = [
  '/bg-backstage.jpg',
  '/bg-stage-pov.jpg',
  '/bg-amps.jpg',
  '/bg-soundboard.jpg'
];

export default function HostScreen() {
  const [roomState, setRoomState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hostUrl, setHostUrl] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }

    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 15000);

    const handleRoomUpdate = (data) => {
      const roomData = data?.room || data;
      setRoomState(roomData);
      if (roomData?.players) {
        setPlayers(roomData.players);
      }
    };

    const onConnect = () => {
      socket.emit('host:createRoom');
    };

    socket.on('connect', onConnect);
    socket.on('room:created', handleRoomUpdate);
    socket.on('host:roomCreated', handleRoomUpdate);
    socket.on('room:stateUpdate', handleRoomUpdate);
    socket.on('room:phaseChanged', handleRoomUpdate);

    socket.on('host:playerJoined', (player) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.id === player.id)) return prev;
        return [...prev, player];
      });
    });

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('host:createRoom');
    }

    return () => {
      clearInterval(bgInterval);
      socket.off('connect', onConnect);
      socket.off('room:created', handleRoomUpdate);
      socket.off('host:roomCreated', handleRoomUpdate);
      socket.off('host:playerJoined');
      socket.off('room:stateUpdate', handleRoomUpdate);
      socket.off('room:phaseChanged', handleRoomUpdate);
    };
  }, []);

  if (!roomState) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#F4F3EE', fontSize: '24px' }}>
        ⚡ BOOTING UP STAGE...
      </div>
    );
  }

  const hostBgStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#09090B',
    backgroundImage: `radial-gradient(circle at center, rgba(9,9,11,0.65) 0%, rgba(5,5,5,0.92) 80%), url('${BACKGROUND_IMAGES[bgIndex]}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    transition: 'background-image 1s ease-in-out'
  };

  // --- LOBBY PHASE ---
  if (roomState.status === 'LOBBY') {
    const roomCode = roomState.roomCode || '----';
    const joinLink = `${hostUrl || 'http://localhost:3000'}?room=${roomCode}`;
    const canStart = players.length >= 2;

    return (
      <div style={hostBgStyle}>
        <div style={{ width: '100%', maxWidth: '900px', backgroundColor: '#383A42', border: '3px solid #595747', padding: '32px', boxShadow: '8px 8px 0px 0px #B91C1C', zIndex: 10, boxSizing: 'border-box' }}>
          
          {/* Header & QR Code Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #595747', paddingBottom: '24px', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', color: '#F4F3EE', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                Reunion Tour
              </h1>
              <p style={{ fontSize: '14px', color: '#A3A39E', margin: 0 }}>
                Join on your phone at:{' '}
                <span style={{ color: '#F87171', fontWeight: 'bold', textDecoration: 'underline' }}>{hostUrl || 'Loading...'}</span>
              </p>
            </div>

            {/* Room Code & QR Box */}
            <div style={{ backgroundColor: '#B91C1C', border: '2px solid #000000', padding: '12px 18px', boxShadow: '4px 4px 0px 0px #F87171', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#F4F3EE', letterSpacing: '0.1em' }}>ROOM CODE</span>
                <span style={{ fontSize: '36px', fontWeight: '900', color: '#F4F3EE', letterSpacing: '0.1em' }}>{roomCode}</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QRCodeSVG value={joinLink} size={80} level="M" />
              </div>
            </div>
          </div>

          {/* How to Play Directions Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', backgroundColor: '#27272A', padding: '16px', border: '2px solid #595747', fontSize: '12px', color: '#F4F3EE' }}>
            <div>
              <p style={{ fontWeight: 'bold', color: '#F87171', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>1. Join & Pick Vibe</p>
              <p style={{ margin: 0, color: '#A3A39E', lineHeight: '1.4' }}>Scan QR code, enter name, and pick an instrument avatar. Headliner picks prompt.</p>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', color: '#F87171', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>2. Submit & Match</p>
              <p style={{ margin: 0, color: '#A3A39E', lineHeight: '1.4' }}>Band submits 1 song per prompt. Headliner listens and guesses track owners.</p>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', color: '#F87171', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>3. Trivia & Backstory</p>
              <p style={{ margin: 0, color: '#A3A39E', lineHeight: '1.4' }}>Headliner takes AI trivia and awards +100 bonus pts for the best backstory!</p>
            </div>
          </div>

          {/* Connected Player Cards */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#E4E4E7', fontWeight: 'bold' }}>BACKSTAGE PASSES ({players.length})</span>
              <span style={{ fontSize: '12px', color: '#F87171', fontStyle: 'italic' }}>Need at least 2 players to start</span>
            </div>

            <div style={{ minHeight: '100px', padding: '16px', border: '2px solid #595747', backgroundColor: '#4F525C', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {players.length === 0 ? (
                <p style={{ color: '#A3A39E', fontStyle: 'italic', margin: 0, width: '100%', textAlign: 'center' }}>Waiting for the band to get back together...</p>
              ) : (
                players.map((p, i) => (
                  <div key={p.id || i} style={{ backgroundColor: '#383A42', color: '#F4F3EE', padding: '10px 16px', border: '2px solid #595747', fontWeight: '900', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '3px 3px 0px 0px #B91C1C' }}>
                    {p.avatar?.image ? (
                      <div style={{ width: '48px', height: '48px', backgroundColor: '#E5E5E5', borderRadius: '4px', border: '2px solid #F59E0B', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={p.avatar.image} alt={p.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '28px' }}>🎸</span>
                    )}
                    <span style={{ fontSize: '16px', textTransform: 'uppercase' }}>{p.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Start Game Trigger */}
          <div style={{ marginTop: '28px', textAlign: 'right' }}>
            <button 
              onClick={() => socket.emit('host:startGame', { roomCode })}
              disabled={!canStart}
              style={{ 
                padding: '14px 28px', 
                fontSize: '20px', 
                fontWeight: '900', 
                backgroundColor: canStart ? '#B91C1C' : '#383A42', 
                color: '#F4F3EE', 
                border: '2px solid #000', 
                cursor: canStart ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: canStart ? '4px 4px 0px 0px #F87171' : 'none',
                textTransform: 'uppercase'
              }}
            >
              <span>Start The Show</span>
              <img src="/mic.png" alt="Mic" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- PHASE 1: CATEGORY SELECTION ---
  if (roomState.status === 'CATEGORY_PICK') {
    const activePlayer = players.find(p => p.id === roomState.currentRound?.activePlayerId);

    return (
      <div style={hostBgStyle}>
        <div style={{ width: '100%', maxWidth: '850px', backgroundColor: '#383A42', border: '3px solid #595747', padding: '32px', boxShadow: '8px 8px 0px 0px #B91C1C', textAlign: 'center', color: '#F4F3EE' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px' }}>
            <span style={{ backgroundColor: '#B91C1C', padding: '4px 12px', border: '1px solid #000', marginRight: '12px' }}>Setlist Picker</span>
            {activePlayer?.name || 'Someone'} is choosing the vibe...
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
            {(roomState.currentRound?.promptChoices || []).map((cat, idx) => (
              <div key={idx} style={{ minHeight: '160px', border: '2px solid #595747', backgroundColor: '#27272A', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#F87171', marginBottom: '8px', textTransform: 'uppercase' }}>{cat.title}</span>
                <span style={{ fontSize: '12px', color: '#A3A39E' }}>{cat.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SCORE RECAP PHASE ---
  if (roomState.status === 'SCORE_RECAP') {
    return <ScoreboardMeter roomState={roomState} />;
  }

  return null;
}