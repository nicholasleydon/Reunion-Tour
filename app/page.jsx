'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { AVATAR_OPTIONS } from '@/lib/avatars';
import BackstageLogo from '@/components/BackstageLogo';

const BACKGROUND_IMAGES = [
  '/bg-backstage.jpg',
  '/bg-stage-pov.jpg',
  '/bg-amps.jpg',
  '/bg-soundboard.jpg'
];

export default function MobilePage() {
  const [mounted, setMounted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    setMounted(true);

    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 15000);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setRoomCode(roomParam.toUpperCase());
      }
    }

    const onPlayerJoined = ({ roomState }) => {
      setJoinedRoom(roomState);
      setErrorMsg('');
    };

    const onRoomStateUpdate = (roomState) => {
      setJoinedRoom(roomState);
    };

    const onPhaseChanged = (data) => {
      setJoinedRoom(data.room || data);
    };

    const onError = (msg) => {
      setErrorMsg(msg);
    };

    socket.on('player:joined', onPlayerJoined);
    socket.on('room:stateUpdate', onRoomStateUpdate);
    socket.on('room:phaseChanged', onPhaseChanged);
    socket.on('error', onError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      clearInterval(bgInterval);
      socket.off('player:joined', onPlayerJoined);
      socket.off('room:stateUpdate', onRoomStateUpdate);
      socket.off('room:phaseChanged', onPhaseChanged);
      socket.off('error', onError);
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) {
      setErrorMsg('Please enter both your name and room code!');
      return;
    }

    socket.emit('player:join', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim(),
      avatar: selectedAvatar
    });
  };

  const stagePovStyle = {
    minHeight: '100vh',
    backgroundImage: `url(${BACKGROUND_IMAGES[bgIndex]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'bottom',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-image 1s ease-in-out'
  };

  const gradientOverlayStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    fontFamily: 'monospace',
    color: '#E5E5E5',
    backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.65), rgba(0,0,0,0.15))'
  };

  if (!mounted) {
    return (
      <div style={stagePovStyle}>
        <div style={gradientOverlayStyle}>
          <div style={{ backgroundColor: '#383A42', border: '3px solid #595747', padding: '24px', color: '#F4F3EE', fontWeight: '900', textAlign: 'center', marginTop: '32px' }}>
            Loading Controller...
          </div>
        </div>
      </div>
    );
  }

  if (joinedRoom) {
    return <MobileController roomState={joinedRoom} socket={socket} stagePovStyle={stagePovStyle} gradientOverlayStyle={gradientOverlayStyle} />;
  }

  return (
    <div style={stagePovStyle}>
      <div style={gradientOverlayStyle}>
        
        <div style={{ border: '1px solid #404040', backgroundColor: 'rgba(23, 23, 23, 0.85)', backdropFilter: 'blur(4px)', padding: '24px', marginTop: '32px', boxShadow: '4px 4px 0px 0px #B91C1C', maxWidth: '400px', margin: '32px auto 0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <BackstageLogo size="large" roomCode={roomCode || 'LIVE'} />
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#DC2626', border: '2px solid #000000', padding: '10px', marginBottom: '16px', color: '#FFFFFF', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#A3A39E', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>
                ROOM CODE
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="E.G. ABCD"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#4F525C',
                  border: '2px solid #595747',
                  color: '#F59E0B',
                  WebkitTextFillColor: '#F59E0B',
                  fontSize: '20px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#A3A39E', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>
                YOUR NAME
              </label>
              <input
                type="text"
                placeholder="Enter your stage name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#4F525C',
                  border: '2px solid #595747',
                  color: '#F4F3EE',
                  WebkitTextFillColor: '#F4F3EE',
                  fontSize: '16px',
                  fontWeight: '900',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#A3A39E', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>
                CHOOSE YOUR INSTRUMENT
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#262626', padding: '10px', border: '2px solid #595747' }}>
                {AVATAR_OPTIONS.map((item) => {
                  const isSelected = selectedAvatar.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedAvatar(item)}
                      title={item.name}
                      style={{
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isSelected ? '3px solid #F59E0B' : '2px solid #525252',
                        backgroundColor: isSelected ? '#F59E0B' : '#E5E5E5',
                        boxShadow: isSelected ? '0px 0px 10px rgba(245, 158, 11, 0.8)' : 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'contain'
                          }} 
                        />
                      ) : (
                        <span style={{ fontSize: '24px' }}>🎸</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '900', textAlign: 'center', marginTop: '10px', textTransform: 'uppercase' }}>
                Selected: {selectedAvatar.name}
              </p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#B91C1C',
                color: '#F4F3EE',
                fontSize: '18px',
                fontWeight: '900',
                padding: '14px',
                textTransform: 'uppercase',
                border: '2px solid #000000',
                boxShadow: '4px 4px 0px 0px #F87171',
                cursor: 'pointer',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Join the Band</span>
              <img src="/mic.png" alt="Mic" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            </button>
          </form>
        </div>

        <div style={{ flexGrow: 1 }}></div>
      </div>
    </div>
  );
}

function MobileController({ roomState, socket, stagePovStyle, gradientOverlayStyle }) {
  const status = roomState?.status || 'LOBBY';
  const player = (roomState?.players || []).find((p) => p.id === socket?.id);

  return (
    <div style={stagePovStyle}>
      <div style={gradientOverlayStyle}>
        
        <div style={{ border: '1px solid #404040', backgroundColor: 'rgba(23, 23, 23, 0.85)', backdropFilter: 'blur(4px)', padding: '16px', marginTop: '16px', boxShadow: '6px 6px 0px 0px #B91C1C', maxWidth: '400px', margin: '16px auto 0 auto', width: '100%', boxSizing: 'border-box', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <BackstageLogo size="small" roomCode={roomState?.roomCode || 'VIP'} />
          </div>

          {status === 'LOBBY' && (
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                {player?.avatar?.image ? (
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#E5E5E5', borderRadius: '8px', border: '3px solid #F59E0B', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={player.avatar.image} alt={player.name} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: '44px' }}>🎸</span>
                )}
              </div>
              <div style={{ backgroundColor: '#595747', border: '2px solid #B91C1C', padding: '12px', marginBottom: '16px', boxShadow: '3px 3px 0px 0px #F87171' }}>
                <h1 style={{ color: '#F4F3EE', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                  WELCOME TO THE BAND!
                </h1>
              </div>
              
              <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#F59E0B', fontSize: '18px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
                  {player?.name}
                </p>
              </div>

              <p style={{ color: '#A3A39E', fontSize: '13px', fontWeight: '700', lineHeight: '1.4' }}>
                Look at the main TV screen! The show starts once everyone joins.
              </p>
            </div>
          )}

          {status === 'CATEGORY_PICK' && <Phase1Category roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}
          {status === 'SONG_SUBMIT' && <Phase2Submit roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}
          {status === 'MATCHING' && <Phase3Matching roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}
          {status === 'TRIVIA_TIME' && <Phase4Trivia roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}
          {status === 'STORY_TIME' && <Phase5StoryTime roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}
          {status === 'SCORE_RECAP' && <Phase6Recap roomCode={roomState.roomCode} socket={socket} roomState={roomState} />}

        </div>

        <div style={{ flexGrow: 1 }}></div>
      </div>
    </div>
  );
}

function Phase1Category({ roomCode, socket, roomState }) {
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const promptGiver = (roomState?.players || []).find((p) => p.id === currentRound.activePlayerId);
  const promptChoices = currentRound.promptChoices || [];

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <img src="/dj.png" alt="Playing DJ" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>
        <div style={{ backgroundColor: '#595747', border: '2px solid #B91C1C', padding: '12px', marginBottom: '16px' }}>
          <h2 style={{ color: '#F4F3EE', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>PLAYING DJ</h2>
        </div>
        <p style={{ color: '#F4F3EE', fontSize: '14px', fontWeight: '700', backgroundColor: '#4F525C', border: '2px solid #595747', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {promptGiver?.avatar?.image && <img src={promptGiver.avatar.image} alt={promptGiver.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
          <span style={{ color: '#F59E0B' }}>{promptGiver?.name}</span> is picking the setlist prompt on their phone!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #595747', paddingBottom: '6px' }}>
        <span style={{ backgroundColor: '#F59E0B', color: '#000000', fontWeight: '900', fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase' }}>YOUR TURN</span>
        <h2 style={{ color: '#F4F3EE', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', margin: '4px 0 0 0' }}>PICK A PROMPT</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {promptChoices.map((prompt, idx) => (
          <button key={idx} onClick={() => socket.emit('player:pickCategory', { roomCode, category: prompt })} style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '10px', textAlign: 'left', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #B91C1C' }}>
            <h3 style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{prompt.title}</h3>
            <p style={{ color: '#A3A39E', fontSize: '11px', fontWeight: '700', margin: '2px 0 0 0' }}>{prompt.description}</p>
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (customTitle.trim()) socket.emit('player:pickCategory', { roomCode, category: { title: customTitle.trim(), description: customDesc.trim() || 'Custom Prompt' } }); }} style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ color: '#F4F3EE', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Or Custom Prompt</span>
        <input type="text" placeholder="Prompt Title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: '#383A42', border: '1px solid #595747', color: '#F4F3EE', fontSize: '12px', boxSizing: 'border-box' }} />
        <input type="text" placeholder="Short description..." value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: '#383A42', border: '1px solid #595747', color: '#F4F3EE', fontSize: '12px', boxSizing: 'border-box' }} />
        <button type="submit" style={{ backgroundColor: '#B91C1C', color: '#F4F3EE', fontWeight: '900', fontSize: '11px', padding: '8px', border: '1px solid #000000', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '2px 2px 0px 0px #F87171' }}>
          <span>Submit Custom</span>
          <img src="/dj.png" alt="DJ" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
        </button>
      </form>
    </div>
  );
}

function Phase2Submit({ roomCode, socket, roomState }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState(null);

  const currentRound = roomState?.currentRound || {};
  const categoryData = typeof currentRound.category === 'object' ? currentRound.category : { title: currentRound.category || 'Music', description: '' };
  const isPromptGiver = currentRound.activePlayerId === socket?.id;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=6`);
      const data = await res.json();
      setSearchResults((data.results || []).map((track) => ({
        id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        releaseDate: track.releaseDate,
        cover: track.artworkUrl100?.replace('100x100', '300x300'),
        previewUrl: track.previewUrl
      })));
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  if (isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>👑</div>
        <h2 style={{ color: '#F4F3EE', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>PROMPT GIVER</h2>
        <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '12px', margin: '12px 0' }}>
          <p style={{ color: '#F59E0B', fontSize: '15px', fontWeight: '900', margin: 0 }}>{categoryData.title}</p>
          <p style={{ color: '#A3A39E', fontSize: '12px', margin: '4px 0 0 0' }}>{categoryData.description}</p>
        </div>
        <p style={{ color: '#A3A39E', fontSize: '13px' }}>Band members are locking in their tracks...</p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <h2 style={{ color: '#F4F3EE', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>TRACK LOCKED IN!</h2>
        <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '12px', margin: '12px 0', textAlign: 'left' }}>
          <p style={{ color: '#F59E0B', fontSize: '15px', fontWeight: '900', margin: 0 }}>{selectedSong?.title}</p>
          <p style={{ color: '#A3A39E', fontSize: '12px', margin: '4px 0 0 0' }}>{selectedSong?.artist}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '8px' }}>
        <span style={{ color: '#F87171', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>PROMPT</span>
        <h2 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: '2px 0' }}>{categoryData.title}</h2>
        <p style={{ color: '#F4F3EE', fontSize: '11px', fontWeight: '700', margin: 0 }}>{categoryData.description}</p>
      </div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
        <input type="text" placeholder="Search track or artist..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flexGrow: 1, padding: '8px', backgroundColor: '#4F525C', border: '2px solid #595747', color: '#F4F3EE', fontSize: '13px' }} />
        <button type="submit" style={{ backgroundColor: '#B91C1C', color: '#F4F3EE', fontWeight: '900', padding: '0 14px', border: 'none', cursor: 'pointer' }}>{isSearching ? '...' : '🔍'}</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
        {searchResults.map((song) => {
          const isPlaying = playingPreviewId === song.id;
          return (
            <div key={song.id} style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {song.cover && <img src={song.cover} alt="Cover" style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #595747' }} />}
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <h3 style={{ color: '#F4F3EE', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</h3>
                  <p style={{ color: '#A3A39E', fontSize: '10px', fontWeight: '700', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {song.previewUrl && (
                  <button type="button" onClick={() => setPlayingPreviewId(isPlaying ? null : song.id)} style={{ flex: 1, backgroundColor: '#595747', color: '#F59E0B', border: '1px solid #B91C1C', fontSize: '10px', fontWeight: '900', padding: '5px', cursor: 'pointer' }}>
                    {isPlaying ? '⏸️ PAUSE' : '▶️ PREVIEW'}
                  </button>
                )}
                {isPlaying && <audio autoPlay src={song.previewUrl} onEnded={() => setPlayingPreviewId(null)} className="hidden" />}
                <button onClick={() => { setSelectedSong(song); socket.emit('player:submitSong', { roomCode, song }); setHasSubmitted(true); }} style={{ flex: 1, backgroundColor: '#B91C1C', color: '#F4F3EE', border: 'none', fontSize: '10px', fontWeight: '900', padding: '5px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>PICK</span>
                  <img src="/dj.png" alt="Pick" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Phase3Matching({ roomCode, socket, roomState }) {
  const [guesses, setGuesses] = useState({});
  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const submissions = Object.values(currentRound.submissions || {});

  let nonPromptPlayers = (roomState?.players || []).filter((p) => p.id !== currentRound.activePlayerId);
  if (Object.values(currentRound.submissions || {}).some((s) => s.isDecoy)) {
    nonPromptPlayers = [...nonPromptPlayers, { id: 'DECOY_BOT', name: '🎭 Decoy / House' }];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #595747', paddingBottom: '6px' }}>
        <h2 style={{ color: '#F4F3EE', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
          {isPromptGiver ? 'MATCH SONGS TO PLAYERS' : 'LISTEN TO THE TRACKS'}
        </h2>
        <p style={{ color: '#A3A39E', fontSize: '11px', margin: '2px 0 0 0' }}>
          {isPromptGiver ? 'Assign 1 player per song!' : 'The Headliner is matching tracks...'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
        {submissions.map((song) => (
          <div key={song.id} style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {song.cover && <img src={song.cover} alt="Cover" style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #595747' }} />}
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <h3 style={{ color: '#F4F3EE', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</h3>
                <p style={{ color: '#A3A39E', fontSize: '10px', fontWeight: '700', margin: '2px 0 0 0' }}>{song.artist}</p>
              </div>
            </div>
            {song.previewUrl && <audio controls src={song.previewUrl} style={{ width: '100%', height: '24px' }} />}
            
            {isPromptGiver && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                {nonPromptPlayers.map((p) => {
                  const isSelected = guesses[song.id] === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setGuesses((prev) => {
                          const updated = { ...prev };
                          Object.keys(updated).forEach((sId) => { if (updated[sId] === p.id) delete updated[sId]; });
                          updated[song.id] = p.id;
                          return updated;
                        });
                      }}
                      style={{
                        padding: '6px',
                        fontSize: '10px',
                        fontWeight: '900',
                        border: isSelected ? '2px solid #F4F3EE' : '1px solid #595747',
                        backgroundColor: isSelected ? '#F59E0B' : '#383A42',
                        color: isSelected ? '#000000' : '#F4F3EE',
                        cursor: 'pointer'
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isPromptGiver && (
        <button type="button" onClick={() => socket.emit('player:submitGuess', { roomCode, guesses })} style={{ width: '100%', backgroundColor: '#B91C1C', color: '#F4F3EE', fontSize: '14px', fontWeight: '900', padding: '10px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F87171', cursor: 'pointer' }}>
          Lock In Matches 🔒
        </button>
      )}
    </div>
  );
}

function Phase4Trivia({ roomCode, socket, roomState }) {
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const promptGiver = (roomState?.players || []).find((p) => p.id === currentRound.activePlayerId);
  const submissions = Object.values(currentRound.submissions || {});
  const selectedSong = currentRound.selectedTriviaSong;
  const triviaData = currentRound.triviaData;
  const userAnswer = currentRound.triviaUserAnswer;

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/trivia.png" alt="Trivia" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>
        <span style={{ backgroundColor: '#F59E0B', color: '#000000', fontWeight: '900', fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase', alignSelf: 'center' }}>SPOTLIGHT TRIVIA</span>
        {!selectedSong ? (
          <p style={{ color: '#F4F3EE', fontSize: '13px', fontWeight: '700', backgroundColor: '#4F525C', border: '2px solid #595747', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {promptGiver?.avatar?.image && <img src={promptGiver.avatar.image} alt={promptGiver.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
            <span style={{ color: '#F59E0B' }}>{promptGiver?.name}</span> is picking a track for AI Trivia...
          </p>
        ) : (
          <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '10px', textAlign: 'left' }}>
            <h3 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{selectedSong.title}</h3>
            <p style={{ color: '#A3A39E', fontSize: '10px', margin: '2px 0 8px 0' }}>{selectedSong.artist}</p>
            <p style={{ color: '#F4F3EE', fontSize: '12px', fontWeight: '900', borderTop: '1px solid #595747', paddingTop: '6px' }}>{triviaData?.question}</p>
            {userAnswer ? (
              <div style={{ marginTop: '8px', padding: '6px', textAlign: 'center', fontWeight: '900', fontSize: '12px', backgroundColor: userAnswer.isCorrect ? '#16A34A' : '#DC2626', color: '#FFFFFF' }}>
                {userAnswer.isCorrect ? `🎉 ${promptGiver?.name} Got It Right!` : `❌ Incorrect! Answer: ${triviaData?.correctAnswerText}`}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                <img src="/stopwatch.png" alt="Waiting" style={{ width: '16px', height: '16px', objectFit: 'contain' }} className="animate-pulse" />
                <p style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '700', margin: 0 }}>Waiting for {promptGiver?.name} to answer...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!selectedSong) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #595747', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <img src="/trivia.png" alt="Trivia" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ color: '#F4F3EE', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>SPOTLIGHT AI TRIVIA</h2>
          <p style={{ color: '#A3A39E', fontSize: '11px', margin: '2px 0 0 0' }}>Pick 1 song to generate trivia!</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {submissions.map((song) => (
            <button key={song.id} type="button" onClick={() => socket.emit('player:selectTriviaSong', { roomCode, songId: song.id })} style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              {song.cover && <img src={song.cover} alt="Cover" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />}
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <h3 style={{ color: '#F4F3EE', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{song.title}</h3>
                <p style={{ color: '#A3A39E', fontSize: '10px', margin: '2px 0 0 0' }}>{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '6px', textAlign: 'center' }}>
        <h2 style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{selectedSong.title}</h2>
        <p style={{ color: '#A3A39E', fontSize: '10px', margin: '2px 0 0 0' }}>{selectedSong.artist}</p>
      </div>
      <div style={{ backgroundColor: '#4F525C', border: '2px solid #595747', padding: '8px' }}>
        <p style={{ color: '#F4F3EE', fontSize: '12px', fontWeight: '900', margin: 0 }}>{triviaData?.question}</p>
      </div>
      {!userAnswer ? (
        <form onSubmit={(e) => { e.preventDefault(); if (selectedOptionId) socket.emit('player:submitTriviaAnswer', { roomCode, optionId: selectedOptionId }); }} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {triviaData?.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => setSelectedOptionId(opt.id)} style={{ padding: '8px', backgroundColor: isSelected ? '#F59E0B' : '#4F525C', color: isSelected ? '#000000' : '#F4F3EE', border: isSelected ? '2px solid #F4F3EE' : '1px solid #595747', fontWeight: '900', fontSize: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: isSelected ? '#000000' : '#383A42', color: isSelected ? '#F4F3EE' : '#A3A39E', width: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{opt.id}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
          <button type="submit" disabled={!selectedOptionId} style={{ backgroundColor: selectedOptionId ? '#B91C1C' : '#383A42', color: selectedOptionId ? '#F4F3EE' : '#71717A', fontSize: '14px', fontWeight: '900', padding: '8px', textTransform: 'uppercase', border: '2px solid #000000', cursor: selectedOptionId ? 'pointer' : 'not-allowed', marginTop: '4px' }}>
            Lock In Guess 🔒
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: userAnswer.isCorrect ? '#16A34A' : '#DC2626', color: '#FFFFFF', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' }}>
            {userAnswer.isCorrect ? '🎉 Correct Answer! (+50 pts)' : `❌ Incorrect! Answer: ${triviaData?.correctAnswerText}`}
          </div>
          <button onClick={() => socket.emit('player:continueToStory', { roomCode })} style={{ backgroundColor: '#B91C1C', color: '#F4F3EE', fontSize: '14px', fontWeight: '900', padding: '10px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F87171', cursor: 'pointer' }}>
            Continue to Storytellers 🎤
          </button>
        </div>
      )}
    </div>
  );
}

function Phase5StoryTime({ roomCode, socket, roomState }) {
  const [selectedBestPlayerId, setSelectedBestPlayerId] = useState('');
  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const nonPromptPlayers = (roomState?.players || []).filter((p) => p.id !== currentRound.activePlayerId);

  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎤</div>
        <h2 style={{ color: '#F4F3EE', fontSize: '17px', fontWeight: '900', textTransform: 'uppercase' }}>STORYTELLERS</h2>
        <p style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '700', backgroundColor: '#4F525C', border: '2px solid #595747', padding: '10px', margin: '10px 0' }}>
          Behind The Music: Share the story behind your song choice with the room!
        </p>
        <p style={{ color: '#A3A39E', fontSize: '11px' }}>The Headliner will award +100 bonus points to the best backstory!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #595747', paddingBottom: '6px' }}>
        <h2 style={{ color: '#F4F3EE', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>BEHIND THE MUSIC</h2>
        <p style={{ color: '#A3A39E', fontSize: '11px', margin: '2px 0 0 0' }}>Award +100 bonus points for best backstory!</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
        {nonPromptPlayers.map((p) => {
          const isSelected = selectedBestPlayerId === p.id;
          return (
            <button key={p.id} type="button" onClick={() => setSelectedBestPlayerId(p.id)} style={{ padding: '8px', backgroundColor: isSelected ? '#F59E0B' : '#4F525C', color: isSelected ? '#000000' : '#F4F3EE', border: isSelected ? '2px solid #F4F3EE' : '1px solid #595747', fontWeight: '900', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {p.avatar?.image && <img src={p.avatar.image} alt={p.name} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />}
                {p.name}
              </span>
              {isSelected && <span>👑 WINNER</span>}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => socket.emit('player:awardBestStory', { roomCode, bestPlayerId: selectedBestPlayerId })} style={{ width: '100%', backgroundColor: '#B91C1C', color: '#F4F3EE', fontSize: '14px', fontWeight: '900', padding: '10px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F87171', cursor: 'pointer', marginTop: '6px' }}>
        Award Winner & Standings 🏆
      </button>
    </div>
  );
}

function Phase6Recap({ roomCode, socket, roomState }) {
  const players = roomState?.players || [];
  const TARGET_SCORE = 2000;
  const currentRound = roomState?.currentRound || {};
  const isHeadliner = currentRound.activePlayerId === socket?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #595747', paddingBottom: '6px' }}>
        <div style={{ fontSize: '28px', marginBottom: '2px' }}>🏆</div>
        <h2 style={{ color: '#F4F3EE', fontSize: '17px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>ROUND RESULTS</h2>
        <p style={{ color: '#A3A39E', fontSize: '11px', margin: '2px 0 0 0' }}>Check the main screen for full reveals!</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
        <h3 style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>VOLUME METER STANDINGS</h3>
        {players.map((p) => {
          const score = p.score || 0;
          const percentage = Math.min(100, Math.round((score / TARGET_SCORE) * 100));
          return (
            <div key={p.id} style={{ backgroundColor: '#4F525C', border: '1px solid #595747', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F4F3EE', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {p.avatar?.image && <img src={p.avatar.image} alt={p.name} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
                  {p.name}
                </span>
                <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '900' }}>{score} / {TARGET_SCORE} PTS</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#383A42', border: '1px solid #595747', display: 'flex', padding: '1px', boxSizing: 'border-box' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: percentage >= 80 ? '#DC2626' : percentage >= 60 ? '#F59E0B' : '#16A34A', transition: 'width 0.5s ease-in-out' }} />
              </div>
            </div>
          );
        })}
      </div>

      {isHeadliner ? (
        <button
          type="button"
          onClick={() => socket.emit('host:startGame', { roomCode })}
          style={{ width: '100%', backgroundColor: '#B91C1C', color: '#F4F3EE', fontSize: '14px', fontWeight: '900', padding: '10px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F87171', cursor: 'pointer', marginTop: '12px' }}
        >
          Start Next Round 🎸
        </button>
      ) : (
        <p style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '700', textAlign: 'center', marginTop: '12px' }}>
          Waiting for the Headliner to start the next round...
        </p>
      )}

    </div>
  );
}