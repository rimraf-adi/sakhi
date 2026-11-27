import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedCursor, BrowserFrame, SANS } from '../components/ScreenChrome';
import { ClinicShell } from '../components/ClinicShell';

function typedSlice(text: string, frame: number, start: number, end: number) {
  if (frame < start) return { value: '', typing: false, done: false };
  if (frame >= end) return { value: text, typing: false, done: true };
  const progress = (frame - start) / (end - start);
  const count = Math.max(1, Math.floor(progress * text.length));
  return { value: text.slice(0, count), typing: true, done: false };
}

function ClinicalInput({
  label,
  value,
  typing = false,
  highlight = false,
  mono = false,
}: {
  label: string;
  value: string;
  typing?: boolean;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#344054' }}>
        {label}
      </label>
      <div
        style={{
          height: 36,
          borderRadius: 6,
          border: highlight ? '1.5px solid #0F4C3A' : '1px solid #D0D5DD',
          backgroundColor: highlight ? '#ECFDF3' : '#FFFFFF',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: value ? '#101828' : '#98A2B3',
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : SANS,
        }}
      >
        <span>{value || 'Pending entry'}</span>
        {typing ? (
          <span
            style={{
              display: 'inline-block',
              width: 1.5,
              height: 15,
              backgroundColor: '#0F4C3A',
              marginLeft: 2,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function Scene2Registration() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const nameField = typedSlice('Priya Sharma', frame, 30, 78);
  const lmpField = typedSlice('16 Apr 2026', frame, 88, 128);
  const langField = typedSlice('Hindi (voice only)', frame, 138, 180);
  const visitField = typedSlice('ANC Visit 3, 24 Nov 2026', frame, 190, 232);
  const ashaField = typedSlice('Meena Devi (+91 98••• ••410)', frame, 242, 282);
  const familyField = typedSlice('Rohit Sharma (Husband)', frame, 290, 326);

  const lmpCalculated = frame >= 128;
  const activated = frame >= 348;

  const cursorX = interpolate(
    frame,
    [0, 30, 120, 210, 295, 340, 420],
    [120, 420, 680, 680, 740, 805, 1180],
    { extrapolateRight: 'clamp' },
  );
  const cursorY = interpolate(
    frame,
    [0, 30, 120, 210, 295, 340, 420],
    [180, 255, 330, 455, 520, 738, 420],
    { extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#EEF1F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(enter, [0, 1], [0.97, 1])})`,
          opacity: enter,
        }}
      >
        <BrowserFrame url="localhost:3002/intake">
          <ClinicShell
            activeNav="intake"
            pageTitle="New ANC intake"
            pageSubtitle="Hospital-owned record registered once at OPD desk"
            alertCount={1}
            rightHeader={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#344054',
                    backgroundColor: '#F3F4F6',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #E4E7EC',
                  }}
                >
                  OPD queue: 42
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0F4C3A',
                    backgroundColor: '#ECFDF3',
                    border: '1px solid #ABEFC6',
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  RCH-2026-048192
                </span>
              </div>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.58fr 1fr',
                gap: 18,
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Left: Structured Hospital EHR Form */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  borderRadius: 8,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Section: Patient and gestation */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                      Patient and gestation
                    </span>
                    <span style={{ fontSize: 11.5, color: '#667085' }}>
                      MoHFW ANC card sync
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.35fr 0.9fr',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <ClinicalInput label="RCH ID" value="RCH-2026-048192" mono />
                    <ClinicalInput
                      label="Patient full name"
                      value={nameField.value}
                      typing={nameField.typing}
                      highlight={nameField.typing}
                    />
                    <ClinicalInput label="Age and parity" value="24 yrs, G2P1" />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.55fr',
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <ClinicalInput
                      label="Last menstrual period"
                      value={lmpField.value}
                      typing={lmpField.typing}
                      highlight={lmpField.typing}
                    />
                    <ClinicalInput
                      label="Calculated gestation"
                      value={
                        lmpCalculated
                          ? '32w 2d, EDD 21 Jan 2027'
                          : 'Awaiting LMP date...'
                      }
                      highlight={lmpCalculated}
                    />
                  </div>

                  {/* Section: Voice companion and escalation routing */}
                  <div
                    style={{
                      borderTop: '1px solid #E4E7EC',
                      paddingTop: 14,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                      Voice companion and escalation routing
                    </span>
                    <span style={{ fontSize: 11.5, color: '#667085' }}>
                      Zero-typing home follow-up
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <ClinicalInput
                      label="Spoken language"
                      value={langField.value}
                      typing={langField.typing}
                      highlight={langField.typing}
                    />
                    <ClinicalInput
                      label="Next ANC visit"
                      value={visitField.value}
                      typing={visitField.typing}
                      highlight={visitField.typing}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <ClinicalInput
                      label="Assigned health professional"
                      value={ashaField.value}
                      typing={ashaField.typing}
                      highlight={ashaField.typing}
                    />
                    <ClinicalInput
                      label="Family escalation contact"
                      value={familyField.value}
                      typing={familyField.typing}
                      highlight={familyField.typing}
                    />
                  </div>

                  {/* Section: Baseline vitals */}
                  <div
                    style={{
                      borderTop: '1px solid #E4E7EC',
                      paddingTop: 14,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                      Baseline vitals
                    </span>
                    <span style={{ fontSize: 11.5, color: '#667085' }}>
                      Recorded at ANC OPD triage
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 10,
                    }}
                  >
                    {[
                      ['Blood pressure', '118/76 mmHg'],
                      ['Hemoglobin', '10.8 g/dL'],
                      ['Blood group', 'O+ positive'],
                      ['Iron tablets', '24 of 28 days'],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          border: '1px solid #E4E7EC',
                          borderRadius: 6,
                          backgroundColor: '#F8F9FA',
                          padding: '8px 10px',
                        }}
                      >
                        <div style={{ fontSize: 11, color: '#475467' }}>{k}</div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#101828',
                            marginTop: 2,
                          }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div
                  style={{
                    borderTop: '1px solid #E4E7EC',
                    paddingTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#475467' }}>
                    {activated ? (
                      <span style={{ color: '#0F4C3A', fontWeight: 600 }}>
                        Record saved. Voice link sent to Priya and Meena Devi.
                      </span>
                    ) : (
                      'Patient receives one-tap voice link, no login required'
                    )}
                  </div>
                  <div
                    style={{
                      padding: '9px 16px',
                      borderRadius: 6,
                      backgroundColor: activated ? '#0F4C3A' : '#101828',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {activated ? 'Activated (RCH-2026-048192)' : 'Register and activate'}
                  </div>
                </div>
              </div>

              {/* Right: Voice Companion Profile + Recent OPD Activations */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  borderRadius: 8,
                  padding: '18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                      Voice companion profile
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: activated ? '#0F4C3A' : '#475467',
                        backgroundColor: activated ? '#ECFDF3' : '#F3F4F6',
                        border: activated ? '1px solid #ABEFC6' : '1px solid #E4E7EC',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {activated ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>
                    {nameField.value || 'New ANC patient'}
                  </div>
                  <div style={{ fontSize: 12, color: '#475467', marginTop: 2, marginBottom: 12 }}>
                    {lmpCalculated
                      ? 'Trimester 3, 32w 2d, EDD 21 Jan 2027'
                      : 'Gestation stage pending LMP entry'}
                  </div>

                  {/* Key-Value Table */}
                  <div
                    style={{
                      border: '1px solid #E4E7EC',
                      borderRadius: 6,
                      overflow: 'hidden',
                      marginBottom: 14,
                    }}
                  >
                    {[
                      ['Voice channel', langField.value || 'Pending'],
                      ['Next ANC visit', visitField.value || 'Pending'],
                      ['Care escalation', ashaField.value || 'Pending'],
                      ['Family alert', familyField.value || 'Pending'],
                    ].map(([k, v], idx) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          fontSize: 12,
                          borderTop: idx > 0 ? '1px solid #E4E7EC' : 'none',
                          backgroundColor: idx % 2 === 0 ? '#F8F9FA' : '#FFFFFF',
                        }}
                      >
                        <span style={{ color: '#475467' }}>{k}</span>
                        <span style={{ color: '#101828', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active Protocol Checks */}
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#101828',
                      marginBottom: 8,
                    }}
                  >
                    Active protocol checks
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      'Pre-eclampsia triad watch (headache, swelling, vision)',
                      'Reduced fetal movement trigger',
                      'Single clarifying voice question limit',
                      'Two-minute escalation to care team and family',
                    ].map((rule) => (
                      <div
                        key={rule}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          color: '#344054',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 99,
                            backgroundColor: '#0F4C3A',
                            flexShrink: 0,
                          }}
                        />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent OPD Activations */}
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#101828',
                      marginBottom: 8,
                    }}
                  >
                    Recent OPD activations
                  </div>
                  <div
                    style={{
                      border: '1px solid #E4E7EC',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    {[
                      ['Sunita Patil', '35w 0d', 'Marathi', 'Active'],
                      ['Kavita Patel', '36w 1d', 'Hindi', 'Active'],
                      ['Meenakshi Rao', '29w 3d', 'Hindi', 'Active'],
                    ].map(([pName, ga, lang, st], idx) => (
                      <div
                        key={pName}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.3fr 0.7fr 0.7fr 0.6fr',
                          alignItems: 'center',
                          padding: '7px 10px',
                          fontSize: 11.5,
                          borderTop: idx > 0 ? '1px solid #E4E7EC' : 'none',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#101828' }}>{pName}</span>
                        <span style={{ color: '#475467' }}>{ga}</span>
                        <span style={{ color: '#475467' }}>{lang}</span>
                        <span style={{ color: '#0F4C3A', fontWeight: 600, textAlign: 'right' }}>
                          {st}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Status Strip */}
                <div
                  style={{
                    borderTop: '1px solid #E4E7EC',
                    paddingTop: 10,
                    fontSize: 11.5,
                    color: '#475467',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Hospital-owned EHR record</span>
                  <span style={{ color: '#0F4C3A', fontWeight: 600 }}>
                    {activated ? 'Voice check-in armed' : 'Ready to activate'}
                  </span>
                </div>
              </div>
            </div>
          </ClinicShell>
        </BrowserFrame>
      </div>
      <AnimatedCursor x={cursorX} y={cursorY} clickFrame={340} />
    </AbsoluteFill>
  );
}
