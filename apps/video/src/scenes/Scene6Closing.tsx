import { interpolate, useCurrentFrame } from 'remotion';
import { SANS, SERIF } from '../components/ScreenChrome';

const ACTIONS = [
  { name: 'Alert', detail: 'Danger signs escalated in minutes', color: '#B42318' },
  { name: 'Save', detail: 'Routine updates logged to timeline', color: '#0F4C3A' },
  { name: 'Connect', detail: 'Closed circle of trusted wisdom', color: '#B54708' },
  { name: 'Summarize', detail: 'One-page pre-visit clinician brief', color: '#101828' },
];

export function Scene6Closing() {
  const frame = useCurrentFrame();

  const activeIdx = Math.min(3, Math.floor(frame / 45));
  const titleOpacity = interpolate(frame, [160, 220], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF6EE',
        color: '#101828',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 140px',
        fontFamily: SANS,
        textAlign: 'center',
      }}
    >
      {/* Restrained Editorial Hairline Strip of 4 Bounded Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          width: '100%',
          maxWidth: 1040,
          borderTop: '1px solid rgba(16, 24, 40, 0.14)',
          borderBottom: '1px solid rgba(16, 24, 40, 0.14)',
          marginBottom: 60,
        }}
      >
        {ACTIONS.map((a, idx) => {
          const isCurrent = idx === activeIdx;
          const isReached = idx <= activeIdx;
          return (
            <div
              key={a.name}
              style={{
                padding: '24px 20px',
                borderLeft: idx > 0 ? '1px solid rgba(16, 24, 40, 0.1)' : 'none',
                borderBottom: isCurrent ? `3px solid ${a.color}` : '3px solid transparent',
                backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 28,
                  fontWeight: 700,
                  color: isReached ? a.color : '#667085',
                  marginBottom: 6,
                }}
              >
                {a.name}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  color: isReached ? '#344054' : '#667085',
                }}
              >
                {a.detail}
              </div>
            </div>
          );
        })}
      </div>

      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 64,
          lineHeight: 1.12,
          fontWeight: 700,
          margin: 0,
          maxWidth: 960,
          letterSpacing: '-0.02em',
          color: '#101828',
        }}
      >
        From weeks to minutes.
      </h2>

      <div style={{ marginTop: 42, opacity: titleOpacity }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: '#D98A63',
            }}
          />
          <span style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700 }}>
            Sakhi
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 22, color: '#475467', fontWeight: 500 }}>
          She speaks. Sakhi listens, and acts.
        </p>
      </div>
    </div>
  );
}
