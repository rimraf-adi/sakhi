import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS, SERIF } from '../components/ScreenChrome';

function SilkWaveField({ frame }: { frame: number }) {
  const width = 1480;
  const height = 220;
  const midY = height * 0.52;
  const bands = 72;
  const step = width / bands;
  const center = (bands - 1) / 2;
  const phase = frame * 0.11;

  const buildPath = (amp: number, freq: number, spd: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= width; x += 8) {
      const taper = Math.sin((x / width) * Math.PI);
      const y =
        midY +
        Math.sin(x * freq + phase * spd) *
          Math.cos(x * 0.0045 - phase * 0.5) *
          amp *
          taper;
      pts.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {Array.from({ length: bands }).map((_, i) => {
        const dist = Math.abs(i - center) / center;
        const win = Math.pow(Math.max(0.06, 1 - dist * 0.9), 1.45);
        const mod = 0.48 + 0.34 * Math.sin(phase * 1.7 + i * 0.32) + 0.18 * Math.cos(phase * 2.6 - i * 0.5);
        const bh = Math.max(6, Math.min(0.95, win * mod) * (height * 0.72));
        const x = i * step + step * 0.5;
        return (
          <line
            key={i}
            x1={x}
            y1={midY - bh / 2}
            x2={x}
            y2={midY + bh / 2}
            stroke="rgba(213, 142, 109, 0.35)"
            strokeWidth={2}
          />
        );
      })}
      <path d={buildPath(46, 0.0085, 1.0)} stroke="#D58E6D" strokeWidth={3.2} fill="none" />
      <path d={buildPath(32, 0.012, -1.3)} stroke="#247A57" strokeWidth={2.2} strokeOpacity={0.75} fill="none" />
      <path d={buildPath(20, 0.006, 0.7)} stroke="#EAB685" strokeWidth={1.6} strokeOpacity={0.8} fill="none" />
    </svg>
  );
}

export function Scene1Landing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1 (0-165): 11 PM gap between monthly hospital visits
  // Beat 2 (165-405): Scary misleading search results & forwards at night
  // Beat 3 (405-630): Sakhi calm voice-first sunrise transition
  const beat = frame < 165 ? 1 : frame < 405 ? 2 : 3;

  const beat1In = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const lineProgress = interpolate(frame, [20, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulse = 1 + Math.sin(frame * 0.16) * 0.08;

  const beat2In = spring({
    frame: Math.max(0, frame - 165),
    fps,
    config: { damping: 18, stiffness: 125 },
  });
  const searchTyped = 'headache and swollen feet 8th month...'.slice(
    0,
    Math.max(1, Math.floor(interpolate(frame, [175, 250], [0, 38], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))),
  );
  const beat2Out = interpolate(frame, [380, 405], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const beat3In = spring({
    frame: Math.max(0, frame - 405),
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: beat === 3 ? '#FAF6EE' : '#0B1715',
        color: beat === 3 ? '#101828' : '#FAF6EE',
        fontFamily: SANS,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 140px',
        paddingBottom: 70,
        overflow: 'hidden',
      }}
    >
      {/* Beat 1: 11 PM Gap Between Monthly Visits */}
      {beat === 1 && (
        <div
          style={{
            width: '100%',
            maxWidth: 1260,
            textAlign: 'center',
            opacity: beat1In,
            transform: `translateY(${interpolate(beat1In, [0, 1], [24, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 108,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#EAB685',
              lineHeight: 1,
            }}
          >
            11:00 PM
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 58,
              fontWeight: 600,
              margin: '20px 0 54px',
              letterSpacing: '-0.02em',
              color: '#FAF6EE',
            }}
          >
            Never guess alone between hospital visits.
          </h1>

          {/* Animated Monthly Visit Timeline */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 980,
              margin: '0 auto',
              paddingTop: 20,
            }}
          >
            <div
              style={{
                height: 3,
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 99,
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: 3,
                  width: `${lineProgress * 100}%`,
                  background: 'linear-gradient(90deg, #58B98E 0%, #EAB685 52%, #58B98E 100%)',
                  borderRadius: 99,
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: -12,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: '#58B98E', border: '4px solid #0B1715' }} />
                <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: '#C8D3CF' }}>Hospital Check-Up</div>
                <div style={{ fontSize: 14, color: '#8EA39C' }}>Day 1</div>
              </div>

              <div style={{ textAlign: 'center', transform: `scale(${pulse})` }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    margin: '0 auto',
                    borderRadius: 99,
                    backgroundColor: '#EAB685',
                    border: '4px solid #0B1715',
                    boxShadow: '0 0 28px rgba(234,182,133,0.75)',
                  }}
                />
                <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: '#EAB685' }}>
                  28 days of quiet questions
                </div>
                <div style={{ fontSize: 15, color: '#9EB0AA' }}>At home, late at night</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ width: 20, height: 20, marginLeft: 'auto', borderRadius: 99, backgroundColor: '#58B98E', border: '4px solid #0B1715' }} />
                <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: '#C8D3CF' }}>Next Check-Up</div>
                <div style={{ fontSize: 14, color: '#8EA39C' }}>Day 28</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beat 2: Scary, Misleading Online Search & Forwards */}
      {beat === 2 && (
        <div
          style={{
            width: '100%',
            maxWidth: 1180,
            opacity: beat2In * beat2Out,
            transform: `translateY(${interpolate(beat2In, [0, 1], [24, 0])}px)`,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#E06246',
              }}
            >
              Why Late-Night Searching Fails Mothers
            </span>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 52,
                fontWeight: 600,
                margin: '12px 0 0',
                color: '#FAF6EE',
              }}
            >
              Scary results. Misleading advice.
            </h2>
          </div>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: 780,
              margin: '0 auto 30px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(224,98,70,0.45)',
              borderRadius: 99,
              padding: '16px 28px',
              fontSize: 22,
              color: '#FAF6EE',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{searchTyped}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#E06246' }}>1,420,000 results</span>
          </div>

          {/* 3 Staggered Misleading Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {[
              {
                tag: 'Misleading Forward',
                title: '"Just drink warm water and sleep it off."',
                sub: 'Forwarded many times in family groups',
                delay: 205,
              },
              {
                tag: 'Panic-Inducing Forum',
                title: 'Worst-case medical articles with zero context',
                sub: 'Spikes midnight anxiety without helping',
                delay: 235,
              },
              {
                tag: 'Unsafe Guesswork',
                title: 'Random home remedies or unverified pills',
                sub: 'Ignores her pregnancy week & history',
                delay: 265,
              },
            ].map((card) => {
              const cardIn = spring({
                frame: Math.max(0, frame - card.delay),
                fps,
                config: { damping: 16, stiffness: 130 },
              });
              return (
                <div
                  key={card.tag}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(224,98,70,0.32)',
                    borderRadius: 18,
                    padding: '24px 24px',
                    opacity: cardIn,
                    transform: `translateY(${interpolate(cardIn, [0, 1], [22, 0])}px)`,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 99,
                      backgroundColor: 'rgba(224,98,70,0.18)',
                      color: '#F6AD94',
                      marginBottom: 14,
                    }}
                  >
                    {card.tag}
                  </span>
                  <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.3, color: '#FAF6EE', marginBottom: 10 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 14.5, color: '#9EB0AA' }}>{card.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Beat 3: Sakhi Calm Voice-First Sunrise */}
      {beat === 3 && (
        <div
          style={{
            width: '100%',
            maxWidth: 1480,
            textAlign: 'center',
            opacity: beat3In,
            transform: `scale(${interpolate(beat3In, [0, 1], [0.96, 1])})`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 99,
                background: 'linear-gradient(135deg, #F3C9AC, #D58E6D)',
              }}
            />
            <span style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em', color: '#101828' }}>
              Sakhi
            </span>
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 46,
              fontWeight: 600,
              margin: '0 0 18px',
              color: '#101828',
              letterSpacing: '-0.015em',
            }}
          >
            Warm. Voice-first. Safe.
          </h2>

          <div style={{ margin: '10px auto 26px', display: 'flex', justifyContent: 'center' }}>
            <SilkWaveField frame={frame} />
          </div>

          <div style={{ display: 'inline-flex', gap: 18 }}>
            {[
              'No misleading advice',
              'Voice-first to calm anxiety',
              'Complete health journal',
            ].map((pill, idx) => {
              const pillIn = spring({
                frame: Math.max(0, frame - (440 + idx * 18)),
                fps,
                config: { damping: 16, stiffness: 130 },
              });
              return (
                <div
                  key={pill}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 99,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(16,24,40,0.12)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#0F4C3A',
                    opacity: pillIn,
                    transform: `translateY(${interpolate(pillIn, [0, 1], [14, 0])}px)`,
                  }}
                >
                  {pill}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
