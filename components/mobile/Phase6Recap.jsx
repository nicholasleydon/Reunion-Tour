// components/mobile/Phase6Recap.jsx
export default function Phase6Recap({ roomState }) {
  const players = roomState?.players || [];
  const TARGET_SCORE = 500;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #3F3F46', paddingBottom: '8px' }}>
        <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏆</div>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>ROUND RESULTS</h2>
        <p style={{ color: '#A1A1AA', fontSize: '11px', margin: '2px 0 0 0' }}>Check the main screen for full reveals!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        <h3 style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>VOLUME METER STANDINGS</h3>
        {players.map((p) => {
          const score = p.score || 0;
          const percentage = Math.min(100, Math.round((score / TARGET_SCORE) * 100));

          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#000000',
                border: '2px solid #3F3F46',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '900' }}>
                  {p.avatar?.icon} {p.name}
                </span>
                <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '900' }}>
                  {score} / {TARGET_SCORE} PTS
                </span>
              </div>

              {/* Volume Meter Meter */}
              <div style={{ width: '100%', height: '14px', backgroundColor: '#27272A', border: '1px solid #52525B', display: 'flex', padding: '1px', boxSizing: 'border-box' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: percentage >= 80 ? '#22C55E' : percentage >= 40 ? '#F59E0B' : '#B91C1C',
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}