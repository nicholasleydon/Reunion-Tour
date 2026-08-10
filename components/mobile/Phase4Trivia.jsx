// components/mobile/Phase4Trivia.jsx
import { useState } from 'react';

export default function Phase4Trivia({ roomCode, socket, roomState }) {
  const [selectedOptionId, setSelectedOptionId] = useState('');

  const currentRound = roomState?.currentRound || {};
  const isPromptGiver = currentRound.activePlayerId === socket?.id;
  const promptGiver = (roomState?.players || []).find((p) => p.id === currentRound.activePlayerId);
  const submissions = Object.values(currentRound.submissions || {});

  const selectedSong = currentRound.selectedTriviaSong;
  const triviaData = currentRound.triviaData;
  const userAnswer = currentRound.triviaUserAnswer;

  const handleSelectSong = (songId) => {
    socket.emit('player:selectTriviaSong', { roomCode, songId });
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!selectedOptionId) return;

    socket.emit('player:submitTriviaAnswer', { roomCode, optionId: selectedOptionId });
  };

  const handleContinue = () => {
    socket.emit('player:continueToStory', { roomCode });
  };

  // AUDIENCE VIEW: Show question and live result on all band members' phones
  if (!isPromptGiver) {
    return (
      <div style={{ textAlign: 'center', margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Replaced robot icon with custom chat bubbles graphic */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/trivia.png" alt="Trivia" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>
        
        <span style={{ backgroundColor: '#F59E0B', color: '#000000', fontWeight: '900', fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase', alignSelf: 'center' }}>
          SPOTLIGHT TRIVIA
        </span>

        {!selectedSong ? (
          <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px' }}>
            {promptGiver?.avatar?.icon} <span style={{ color: '#F59E0B' }}>{promptGiver?.name}</span> is picking a track for AI Trivia...
          </p>
        ) : (
          <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '12px', textAlign: 'left' }}>
            <h3 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{selectedSong.title}</h3>
            <p style={{ color: '#A1A1AA', fontSize: '12px', margin: '2px 0 10px 0' }}>{selectedSong.artist}</p>
            
            <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '900', borderTop: '1px solid #3F3F46', paddingTop: '8px' }}>
              {triviaData?.question}
            </p>

            {userAnswer ? (
              <div style={{ marginTop: '12px', padding: '10px', textAlign: 'center', fontWeight: '900', fontSize: '14px', backgroundColor: userAnswer.isCorrect ? '#22C55E' : '#B91C1C', color: '#FFFFFF' }}>
                {userAnswer.isCorrect ? `🎉 ${promptGiver?.name} Got It Right!` : `❌ Incorrect! Answer: ${triviaData?.correctAnswerText}`}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                {/* Replaced generic hourglass with custom stopwatch graphic */}
                <img src="/stopwatch.png" alt="Waiting" style={{ width: '18px', height: '18px', objectFit: 'contain' }} className="animate-pulse" />
                <p style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '700', margin: 0 }}>
                  Waiting for {promptGiver?.name} to answer...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // GUESSER STEP 1: Select track
  if (!selectedSong) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #3F3F46', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
            <img src="/trivia.png" alt="Trivia" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>SPOTLIGHT AI TRIVIA</h2>
          <p style={{ color: '#A1A1AA', fontSize: '11px', margin: '2px 0 0 0' }}>Pick 1 song to generate trivia!</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {submissions.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => handleSelectSong(song.id)}
              style={{
                backgroundColor: '#000000',
                border: '2px solid #3F3F46',
                padding: '10px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              {song.cover && <img src={song.cover} alt="Cover" style={{ width: '44px', height: '44px', objectFit: 'cover' }} />}
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{song.title}</h3>
                <p style={{ color: '#A1A1AA', fontSize: '11px', margin: '2px 0 0 0' }}>{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // GUESSER STEP 2: Answer question with explicit selected button state
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '10px', textAlign: 'center' }}>
        <h2 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{selectedSong.title}</h2>
        <p style={{ color: '#A1A1AA', fontSize: '12px', margin: '2px 0 0 0' }}>{selectedSong.artist}</p>
      </div>

      <div style={{ backgroundColor: '#000000', border: '2px solid #3F3F46', padding: '10px' }}>
        <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '900', margin: 0 }}>{triviaData?.question}</p>
      </div>

      {!userAnswer ? (
        <form onSubmit={handleSubmitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {triviaData?.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                style={{
                  padding: '12px',
                  backgroundColor: isSelected ? '#F59E0B' : '#000000',
                  color: isSelected ? '#000000' : '#FFFFFF',
                  border: isSelected ? '2px solid #FFFFFF' : '1px solid #3F3F46',
                  fontWeight: '900',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ backgroundColor: isSelected ? '#000000' : '#27272A', color: isSelected ? '#FFFFFF' : '#A1A1AA', width: '24px', height: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{opt.id}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}

          <button
            type="submit"
            disabled={!selectedOptionId}
            style={{
              backgroundColor: selectedOptionId ? '#B91C1C' : '#27272A',
              color: selectedOptionId ? '#FFFFFF' : '#71717A',
              fontSize: '16px',
              fontWeight: '900',
              padding: '12px',
              textTransform: 'uppercase',
              border: '2px solid #000000',
              cursor: selectedOptionId ? 'pointer' : 'not-allowed',
              marginTop: '8px'
            }}
          >
            Lock In Guess 🔒
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <div style={{ padding: '12px', backgroundColor: userAnswer.isCorrect ? '#22C55E' : '#B91C1C', color: '#FFFFFF', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>
            {userAnswer.isCorrect ? '🎉 Correct Answer! (+50 pts)' : `❌ Incorrect! Answer: ${triviaData?.correctAnswerText}`}
          </div>

          <button
            onClick={handleContinue}
            style={{ backgroundColor: '#B91C1C', color: '#FFFFFF', fontSize: '16px', fontWeight: '900', padding: '12px', textTransform: 'uppercase', border: '2px solid #000000', boxShadow: '3px 3px 0px 0px #F59E0B', cursor: 'pointer' }}
          >
            Continue to Story Time 🎤
          </button>
        </div>
      )}
    </div>
  );
}