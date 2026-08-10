export default function BackstageLogo({ size = 'normal', roomCode = 'VIP' }) {
  const isLarge = size === 'large';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#F4F3EE',
        border: '3px solid #1C1917',
        borderRadius: '6px',
        padding: isLarge ? '16px 28px' : '10px 18px',
        boxShadow: '4px 4px 0px 0px #000000',
        position: 'relative',
        transform: 'rotate(-1deg)',
        boxSizing: 'border-box'
      }}
    >
      {/* Lanyard Punch Hole */}
      <div
        style={{
          width: isLarge ? '18px' : '12px',
          height: isLarge ? '18px' : '12px',
          backgroundColor: '#171717',
          borderRadius: '50%',
          marginBottom: isLarge ? '10px' : '6px',
          border: '2px solid #57534E',
          boxShadow: 'inset 0px 2px 4px rgba(0,0,0,0.8)'
        }}
      />

      {/* Pass Header Banner */}
      <div
        style={{
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          fontSize: isLarge ? '11px' : '9px',
          fontWeight: '900',
          letterSpacing: '0.2em',
          padding: '2px 8px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          border: '1px solid #000000'
        }}
      >
        All Access Pass
      </div>

      {/* Main Brand Title */}
      <h1
        style={{
          fontFamily: 'monospace',
          fontSize: isLarge ? '28px' : '18px',
          fontWeight: '900',
          color: '#1C1917',
          letterSpacing: '0.05em',
          margin: 0,
          textAlign: 'center',
          lineHeight: '1',
          textTransform: 'uppercase',
          textShadow: '1px 1px 0px #D6D3D1'
        }}
      >
        Reunion Tour
      </h1>

      {/* Sub-label / Room Indicator */}
      <div
        style={{
          fontSize: isLarge ? '10px' : '8px',
          fontWeight: '700',
          color: '#78716C',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginTop: '4px',
          marginBottom: isLarge ? '10px' : '6px'
        }}
      >
        VIP // SEC {roomCode}
      </div>

      {/* Decorative Barcode */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          alignItems: 'center',
          height: isLarge ? '20px' : '14px',
          backgroundColor: '#FFFFFF',
          padding: '2px 4px',
          border: '1px dashed #A8A29E'
        }}
      >
        <div style={{ width: '3px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '1px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '4px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '2px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '1px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '5px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '2px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '3px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '1px', height: '100%', backgroundColor: '#000' }} />
        <div style={{ width: '4px', height: '100%', backgroundColor: '#000' }} />
      </div>
    </div>
  );
}