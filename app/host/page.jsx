'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { QRCodeSVG } from 'qrcode.react';
import BackstageLogo from '@/components/BackstageLogo';

const BACKGROUND_OPTIONS = [
  '/bg-backstage.jpg',
  '/bg-soundboard.jpg',
  '/bg-amps.jpg'
];

export default function HostPage() {
  const [mounted, setMounted] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [hostUrl, setHostUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') setHostUrl(window.location.origin);

    const onConnect = () => socket.emit('host:createRoom');
    const onUpdate = (room) => setRoomState(room.room || room);

    socket.on('connect', onConnect);
    socket.on('room:created', onUpdate);
    socket.on('room:stateUpdate', onUpdate);
    socket.on('room:phaseChanged', onUpdate);

    if (!socket.connected) socket.connect();
    else socket.emit('host:createRoom');

    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_OPTIONS.length);
    }, 12000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room:created', onUpdate);
      socket.off('room:stateUpdate', onUpdate);
      socket.off('room:phaseChanged', onUpdate);
      socket.disconnect();
      clearInterval(bgInterval);
    };
  }, []);

  if (!mounted || !roomState) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#F4F3EE', fontFamily: 'monospace' }}>⚡ CREATING STAGE...</div>
      </div>
    );
  }

  const players = roomState.players || [];
  const roomCode = roomState.roomCode || '----';
  const currentRound = roomState.currentRound || {};
  const joinLink = `${hostUrl || 'http://localhost:3000'}?room=${roomCode}`;
  
  const categoryData = typeof currentRound.category === 'object'
    ? currentRound.category
    : { title: currentRound.category || 'Music', description: '' };
    
  const promptGiver = players.find(p => p.id === currentRound.activePlayerId);

  const hostBgStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#09090B',
    backgroundImage: `radial-gradient(circle at center, rgba(9,9,11,0.55) 0%, rgba(5,5,5,0.92) 80%), url('${BACKGROUND_OPTIONS[currentBgIndex]}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    transition: 'background-image 1s ease-in-out'
  };

  const PersistentHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#383A42', border: '2px solid #595747', padding: '12px 20px', marginBottom: '20px', boxShadow: '4px 4px 0px 0px #B91C1C' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <BackstageLogo size="small" roomCode={roomCode} />
        <span style={{ fontSize: '12px', color: '#A3A39E', fontWeight: '700' }}>{hostUrl}</span>
      </div>
      <div style={{ backgroundColor: '#B91C1C', border: '1px solid #000000', padding: '6px 14px', boxShadow: '2px 2px 0px 0px #F87171', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#F4F3EE' }}>CODE</span>
          <span style={{ fontSize: '22px', fontWeight: '900', color: '#F4F3EE' }}>{roomCode}</span>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '3px', borderRadius: '2px' }}>
          <QRCodeSVG value={joinLink} size={42} level="M" />
        </div>
      </div>
    </div>
  );

  // --- 1. LOBBY VIEW ---
  if (roomState.status === 'LOBBY') {
    const canStart = players.length >= 2;
    return (
      <div style={hostBgStyle}>
        <div style={{ width: '100%', maxWidth: '850px', backgroundColor: '#383A42', border: '3px solid #595747', padding: '32px', boxShadow: '8px 8px 0px 0px #B91C1C', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #595747', paddingBottom: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <BackstageLogo size="large" roomCode={roomCode} />
              <div>
                <p style={{ fontSize: '14px', color: '#A3A39E', margin: 0 }}>Join on your phone at</p>
                <span style={{ fontSize: '14px', color: '#F87171', textDecoration: 'underline', fontWeight: 'bold' }}>{hostUrl}</span>
              </div>
            </div>
            <div style={{ backgroundColor: '#B91C1C', border: '2px solid #000000', padding: '12px 18px', boxShadow: '4px 4px 0px 0px #F87171', display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#F4F3EE' }}>ROOM CODE</span>
                <span style={{ fontSize: '36px', fontWeight: '900', color: '#F4F3EE' }}>{roomCode}</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '4px' }}>
                <QRCodeSVG value={joinLink} size={84} level="M" />
              </div>
            </div>
          </div>
          
          <h2 style={{ fontSize: '18px', color: '#E4E4E7', marginBottom: '16px' }}>BACKSTAGE PASSES ({players.length})</h2>
          <div style={{ minHeight: '120px', padding: '16px', border: '2px solid #595747', backgroundColor: '#4F525C', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {players.length === 0 ? <p style={{ color: '#A3A39E', fontStyle: 'italic' }}>Waiting for the band...</p> : 
              players.map(p => (
                <div key={p.id} style={{ backgroundColor: '#383A42', color: '#F4F3EE', padding: '12px 18px', border: '2px solid #595747', fontWeight: '900', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '3px 3px 0px 0px #B91C1C' }}>
                  {p.avatar?.image ? (
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#E5E5E5', borderRadius: '6px', border: '2px solid #F59E0B', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={p.avatar.image} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <span style={{ fontSize: '40px' }}>🎸</span>
                  )}
                  <span style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name}</span>
                </div>
              ))
            }
          </div>
          
          <div style={{ marginTop: '32px', textAlign: 'right' }}>
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
                boxShadow: canStart ? '4px 4px 0px 0px #F87171' : 'none'
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

  // --- 2. MATCHING VIEW ---
  if (roomState.status === 'MATCHING') {
    const submissions = Object.values(currentRound.submissions || {});

    return (
      <div style={hostBgStyle}>
        <div style={{ width: '100%', maxWidth: '850px', zIndex: 10 }}>
          <PersistentHeader />
          <div style={{ backgroundColor: '#383A42', border: '3px solid #595747', padding: '32px', boxShadow: '8px 8px 0px 0px #B91C1C' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', color: '#A3A39E', letterSpacing: '0.1em', margin: 0 }}>CURRENT CATEGORY</h2>
              <h3 style={{ fontSize: '36px', color: '#F4F3EE', margin: '8px 0' }}>{categoryData.title}</h3>
              <p style={{ fontSize: '18px', color: '#F87171', fontStyle: 'italic', margin: '0 0 16px 0' }}>"{categoryData.description}"</p>
              
              <div style={{ display: 'inline-block', backgroundColor: '#4F525C', padding: '8px 16px', border: '1px solid #595747' }}>
                <span style={{ color: '#F4F3EE' }}>Headliner <strong>{promptGiver?.name}</strong> is mapping tracks to players...</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {submissions.map((song, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#27272A', padding: '16px', border: '2px solid #595747' }}>
                  <img src={song.cover} alt="Album Art" style={{ width: '80px', height: '80px', border: '1px solid #000' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#F4F3EE', fontSize: '22px', margin: '0 0 6px 0', fontWeight: '900' }}>{song.title}</h4>
                    <p style={{ color: '#A3A39E', fontSize: '18px', margin: 0 }}>{song.artist}</p>
                  </div>
                  <div>
                    {song.previewUrl ? (
                      <audio controls src={song.previewUrl} style={{ height: '40px' }} />
                    ) : (
                      <span style={{ color: '#F87171', fontStyle: 'italic' }}>No preview available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={hostBgStyle}>
      <div style={{ width: '100%', maxWidth: '850px', zIndex: 10 }}>
        <PersistentHeader />
        <div style={{ backgroundColor: '#383A42', padding: '32px', border: '3px solid #595747', textAlign: 'center' }}>
          <h2 style={{ color: '#F4F3EE', margin: 0 }}>Show in progress...</h2>
        </div>
      </div>
    </div>
  );
}