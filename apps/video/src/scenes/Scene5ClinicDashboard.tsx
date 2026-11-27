import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedCursor, BrowserFrame, SANS } from '../components/ScreenChrome';
import { ClinicShell } from '../components/ClinicShell';

const TRIAGE_QUEUE = [
  {
    id: 'priya',
    severity: 'Urgent',
    name: 'Priya Sharma',
    stage: '32w 2d',
    time: '11:14 PM',
    lang: 'Hindi',
    summary: 'Headache, swelling, and blurred vision confirmed on voice check-in',
    tags: ['Health professional Meena notified', 'Husband Rohit notified'],
    primary: true,
  },
  {
    id: 'sunita',
    severity: 'Doubt',
    name: 'Sunita Patil',
    stage: '35w 0d',
    time: '10:58 PM',
    lang: 'Marathi',
    summary: 'Reduced baby movement reported; hospital team called patient',
    tags: ['Hospital called'],
    primary: false,
  },
  {
    id: 'meenakshi',
    severity: 'Routine',
    name: 'Meenakshi Rao',
    stage: '29w 3d',
    time: '9:40 PM',
    lang: 'Hindi',
    summary: 'Evening check-in normal; fetal movement active, no danger signs',
    tags: ['Saved to timeline'],
    primary: false,
  },
  {
    id: 'kavita',
    severity: 'Follow-up',
    name: 'Kavita Patel',
    stage: '36w 1d',
    time: '7:15 PM',
    lang: 'Hindi',
    summary: 'ANC Visit 4 scheduled tomorrow at 10:00 AM; voice reminder delivered',
    tags: ['Reminder sent'],
    primary: false,
  },
  {
    id: 'rekha',
    severity: 'Routine',
    name: 'Rekha Verma',
    stage: '24w 5d',
    time: '6:30 PM',
    lang: 'Hindi',
    summary: 'Iron tablet adherence logged (26 of 28 days); no symptoms reported',
    tags: ['Saved to timeline'],
    primary: false,
  },
];

const AUDIT_ROWS = [
  {
    ts: '19 Nov, 11:14 PM',
    patient: 'Priya Sharma',
    stage: '32w 2d',
    exchange: 'Headache, swelling, blurred vision (Hindi)',
    action: 'Urgent alert to care team and family; nurse acknowledged',
    reviewer: 'Dr. Ananya Kulkarni',
    status: 'Verified',
  },
  {
    ts: '19 Nov, 10:58 PM',
    patient: 'Sunita Patil',
    stage: '35w 0d',
    exchange: 'Reduced fetal movement doubt (Marathi)',
    action: 'Escalated to ANC ward; hospital called in 14m',
    reviewer: 'Dr. Ananya Kulkarni',
    status: 'Verified',
  },
  {
    ts: '14 Nov, 8:10 PM',
    patient: 'Priya Sharma',
    stage: '31w 4d',
    exchange: 'Missed iron tablet and mild fatigue (Hindi)',
    action: 'Ruled out dizziness; evening voice reminder set',
    reviewer: 'Dr. Ananya Kulkarni',
    status: 'Verified',
  },
  {
    ts: '14 Nov, 7:22 PM',
    patient: 'Kavita Devi',
    stage: '35w 3d',
    exchange: 'Swelling in feet check-in (Hindi)',
    action: 'BP check scheduled for next morning OPD visit',
    reviewer: 'Dr. Ananya Kulkarni',
    status: 'Verified',
  },
  {
    ts: '13 Nov, 9:40 PM',
    patient: 'Meenakshi Rao',
    stage: '28w 4d',
    exchange: 'Routine evening check-in (Hindi)',
    action: 'Saved to pre-visit timeline; no alert required',
    reviewer: 'Sr. Anita Deshmukh',
    status: 'Verified',
  },
  {
    ts: '12 Nov, 6:15 PM',
    patient: 'Rekha Verma',
    stage: '23w 5d',
    exchange: 'Iron adherence and diet check (Hindi)',
    action: 'Logged 26 of 28 days; no danger signs',
    reviewer: 'Sr. Anita Deshmukh',
    status: 'Verified',
  },
];

export function Scene5ClinicDashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const acknowledged = frame >= 120;
  const showAudit = frame >= 185;

  const cursorX = interpolate(
    frame,
    [0, 65, 115, 160, 180, 260],
    [320, 620, 775, 420, 145, 860],
    { extrapolateRight: 'clamp' },
  );
  const cursorY = interpolate(
    frame,
    [0, 65, 115, 160, 180, 260],
    [210, 310, 368, 310, 308, 420],
    { extrapolateRight: 'clamp' },
  );
  const clickFrame = frame < 155 ? 115 : 180;

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
        <BrowserFrame
          url={showAudit ? 'localhost:3002/safety-audit' : 'localhost:3002/escalations'}
        >
          <ClinicShell
            activeNav={showAudit ? 'audit' : 'escalations'}
            pageTitle={
              showAudit
                ? 'Clinical safety audit'
                : 'Escalations and pre-visit timeline'
            }
            pageSubtitle={
              showAudit
                ? 'Monthly doctor review of home voice exchanges and escalation response times'
                : 'Real-time clinical alerts from home voice check-ins under MoHFW guidelines'
            }
            alertCount={acknowledged ? 0 : 1}
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
                  {showAudit ? 'Audit window: Nov 2026' : 'Auto-refresh: live'}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#101828',
                    padding: '5px 12px',
                    borderRadius: 6,
                  }}
                >
                  New ANC intake
                </span>
              </div>
            }
          >
            {!showAudit ? (
              <>
                {/* Hairline-Divided Metric Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E7EC',
                    borderRadius: 8,
                    marginBottom: 16,
                    flexShrink: 0,
                  }}
                >
                  {[
                    {
                      label: 'Urgent alerts',
                      value: acknowledged ? '0' : '1',
                      sub: acknowledged ? 'All urgent alerts acknowledged' : 'Immediate call required',
                      color: acknowledged ? '#0F4C3A' : '#B42318',
                    },
                    {
                      label: 'Registered cohort',
                      value: '42',
                      sub: "District Women's Hospital",
                      color: '#101828',
                    },
                    {
                      label: 'Response under 2 hours',
                      value: '94%',
                      sub: 'Care team and hospital staff',
                      color: '#0F4C3A',
                    },
                    {
                      label: 'Unacknowledged',
                      value: '0',
                      sub: 'Over 15 minutes',
                      color: '#101828',
                    },
                  ].map((m, idx) => (
                    <div
                      key={m.label}
                      style={{
                        padding: '12px 16px',
                        borderLeft: idx > 0 ? '1px solid #E4E7EC' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#475467' }}>
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: m.color,
                          marginTop: 2,
                        }}
                      >
                        {m.value}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#667085', marginTop: 2 }}>
                        {m.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Split: Triage Queue (5 rows) + Pre-Visit Timeline */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.42fr 1fr',
                    gap: 16,
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  {/* Left: Triage Queue */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #E4E7EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                        Triage queue
                      </span>
                      <span style={{ fontSize: 11.5, color: '#667085' }}>
                        Sorted by clinical urgency
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {TRIAGE_QUEUE.map((row, idx) => {
                        const isPriya = row.primary;
                        const isUrgentActive = isPriya && !acknowledged;
                        const badgeBg = isPriya
                          ? acknowledged
                            ? '#ECFDF3'
                            : '#FEF3F2'
                          : row.severity === 'Doubt' || row.severity === 'Follow-up'
                            ? '#FFFAEB'
                            : '#ECFDF3';
                        const badgeBorder = isPriya
                          ? acknowledged
                            ? '#ABEFC6'
                            : '#FECDCA'
                          : row.severity === 'Doubt' || row.severity === 'Follow-up'
                            ? '#FEDF89'
                            : '#ABEFC6';
                        const badgeColor = isPriya
                          ? acknowledged
                            ? '#0F4C3A'
                            : '#B42318'
                          : row.severity === 'Doubt' || row.severity === 'Follow-up'
                            ? '#B54708'
                            : '#0F4C3A';

                        return (
                          <div
                            key={row.id}
                            style={{
                              padding: isPriya ? '13px 16px' : '11px 16px',
                              borderTop: idx > 0 ? '1px solid #E4E7EC' : 'none',
                              borderLeft: isPriya
                                ? acknowledged
                                  ? '3px solid #0F4C3A'
                                  : '3px solid #B42318'
                                : '3px solid transparent',
                              backgroundColor: isUrgentActive ? '#FFFCFB' : '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 4,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '1px 7px',
                                    borderRadius: 6,
                                    backgroundColor: badgeBg,
                                    border: `1px solid ${badgeBorder}`,
                                    color: badgeColor,
                                  }}
                                >
                                  {isPriya && acknowledged ? 'Acknowledged' : row.severity}
                                </span>
                                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#101828' }}>
                                  {row.name}
                                </span>
                                <span style={{ fontSize: 12, color: '#475467' }}>
                                  {row.stage}, {row.lang}
                                </span>
                              </div>
                              <span style={{ fontSize: 11.5, color: '#667085' }}>
                                {row.time}
                              </span>
                            </div>

                            <div
                              style={{
                                fontSize: 12.5,
                                color: '#344054',
                                lineHeight: 1.4,
                                marginBottom: isPriya ? 10 : 0,
                              }}
                            >
                              {row.summary}
                            </div>

                            {isPriya ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {row.tags.map((t) => (
                                    <span
                                      key={t}
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: '#344054',
                                        backgroundColor: '#F3F4F6',
                                        border: '1px solid #E4E7EC',
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                      }}
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    backgroundColor: acknowledged ? '#0F4C3A' : '#101828',
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {acknowledged ? 'Acknowledged 11:16 PM' : 'Acknowledge and call'}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Pre-visit Timeline */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      borderRadius: 8,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#101828' }}>
                          Pre-visit timeline: Priya Sharma
                        </span>
                        <span style={{ fontSize: 11.5, color: '#475467' }}>
                          RCH-2026-048192
                        </span>
                      </div>

                      {/* Baseline chips */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: 6,
                          marginTop: 8,
                          marginBottom: 12,
                        }}
                      >
                        {[
                          ['BP', '118/76'],
                          ['Hb', '10.8 g/dL'],
                          ['Iron', '24/28 days'],
                          ['EDD', '21 Jan 27'],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              backgroundColor: '#F8F9FA',
                              border: '1px solid #E4E7EC',
                              borderRadius: 6,
                              padding: '5px 8px',
                            }}
                          >
                            <div style={{ fontSize: 10.5, color: '#667085' }}>{k}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#101828' }}>
                              {v}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Matched Protocol */}
                      <div
                        style={{
                          backgroundColor: '#FEF3F2',
                          border: '1px solid #FECDCA',
                          borderRadius: 6,
                          padding: '8px 10px',
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#B42318' }}>
                          Matched MoHFW protocol: Pre-eclampsia danger triad
                        </div>
                        <div style={{ fontSize: 11.5, color: '#344054', marginTop: 2 }}>
                          Action: Immediate BP check and obstetric evaluation
                        </div>
                      </div>

                      {/* 3 Timestamped Timeline Entries */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          {
                            date: '19 Nov, 11:14 PM',
                            tag: 'Alert sent',
                            tagColor: '#B42318',
                            quote:
                              '"Do din se sar dard hai aur pair sujhe hue hain. Subah se thoda dhundhla lag raha hai."',
                            note: 'Confirmed blurred vision on 1-question check. Care team and husband alerted.',
                          },
                          {
                            date: '14 Nov, 8:10 PM',
                            tag: 'Saved and reminded',
                            tagColor: '#0F4C3A',
                            quote:
                              '"Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai."',
                            note: 'Ruled out dizziness. Evening voice reminder scheduled.',
                          },
                          {
                            date: '08 Nov, 10:30 AM',
                            tag: 'ANC Visit 2',
                            tagColor: '#475467',
                            quote: "Routine OPD check at District Women's Hospital",
                            note: 'BP 118/76 mmHg, Hb 10.8 g/dL, fetal heart rate normal.',
                          },
                        ].map((item) => (
                          <div
                            key={item.date}
                            style={{
                              borderLeft: `2px solid ${item.tagColor}`,
                              paddingLeft: 10,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 11,
                                marginBottom: 2,
                              }}
                            >
                              <span style={{ fontWeight: 600, color: item.tagColor }}>
                                {item.tag}
                              </span>
                              <span style={{ color: '#667085' }}>{item.date}</span>
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#101828',
                                lineHeight: 1.35,
                              }}
                            >
                              {item.quote}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#475467', marginTop: 2 }}>
                              {item.note}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid #E4E7EC',
                        paddingTop: 9,
                        fontSize: 11.5,
                        color: '#475467',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Zero diagnoses generated</span>
                      <span style={{ color: '#0F4C3A', fontWeight: 600 }}>
                        Hospital-owned record
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Safety Audit View (Frames 360-600) */
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E7EC',
                    borderRadius: 8,
                    marginBottom: 16,
                    flexShrink: 0,
                  }}
                >
                  {[
                    {
                      label: 'Missed danger signs (sampled)',
                      value: '0 missed',
                      sub: 'Target: 0 missed across monthly doctor reviews',
                      color: '#0F4C3A',
                    },
                    {
                      label: 'Human response under 2 hours',
                      value: '94% (9 in 10+)',
                      sub: 'Danger alerts answered by care team or hospital staff',
                      color: '#B54708',
                    },
                    {
                      label: 'Record ownership',
                      value: 'Hospital-owned',
                      sub: 'Zero third-party sharing, consent-only research',
                      color: '#101828',
                    },
                  ].map((m, idx) => (
                    <div
                      key={m.label}
                      style={{
                        padding: '12px 18px',
                        borderLeft: idx > 0 ? '1px solid #E4E7EC' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#475467' }}>
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          lineHeight: 1.25,
                          color: m.color,
                          marginTop: 2,
                        }}
                      >
                        {m.value}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#667085', marginTop: 2 }}>
                        {m.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full-Height Audited Voice Exchanges Table */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E7EC',
                    borderRadius: 8,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid #E4E7EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>
                      Audited voice exchanges
                    </span>
                    <span style={{ fontSize: 11.5, color: '#475467' }}>
                      Every check-in logged for clinician review
                    </span>
                  </div>

                  {/* Table Header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.05fr 0.95fr 0.55fr 1.6fr 1.7fr 1.05fr 0.65fr',
                      gap: 10,
                      padding: '9px 16px',
                      backgroundColor: '#F8F9FA',
                      borderBottom: '1px solid #E4E7EC',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#475467',
                    }}
                  >
                    <span>Timestamp</span>
                    <span>Patient</span>
                    <span>Stage</span>
                    <span>Voice check-in</span>
                    <span>Action taken</span>
                    <span>Reviewer</span>
                    <span style={{ textAlign: 'right' }}>Status</span>
                  </div>

                  {/* Table Rows */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {AUDIT_ROWS.map((r, idx) => (
                      <div
                        key={r.ts + r.patient}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.05fr 0.95fr 0.55fr 1.6fr 1.7fr 1.05fr 0.65fr',
                          gap: 10,
                          alignItems: 'center',
                          padding: '11px 16px',
                          borderTop: idx > 0 ? '1px solid #E4E7EC' : 'none',
                          fontSize: 12,
                          flex: 1,
                        }}
                      >
                        <span style={{ color: '#475467' }}>{r.ts}</span>
                        <span style={{ fontWeight: 600, color: '#101828' }}>{r.patient}</span>
                        <span style={{ color: '#475467' }}>{r.stage}</span>
                        <span style={{ color: '#101828' }}>{r.exchange}</span>
                        <span style={{ color: '#344054' }}>{r.action}</span>
                        <span style={{ color: '#475467' }}>{r.reviewer}</span>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#0F4C3A',
                              backgroundColor: '#ECFDF3',
                              border: '1px solid #ABEFC6',
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: '10px 16px',
                      borderTop: '1px solid #E4E7EC',
                      backgroundColor: '#F8F9FA',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: '#475467',
                    }}
                  >
                    <span>0 diagnoses generated, 0 medicine prescriptions advised</span>
                    <span style={{ fontWeight: 600, color: '#0F4C3A' }}>
                      Monthly audit signed off
                    </span>
                  </div>
                </div>
              </>
            )}
          </ClinicShell>
        </BrowserFrame>
      </div>
      <AnimatedCursor x={cursorX} y={cursorY} clickFrame={clickFrame} />
    </AbsoluteFill>
  );
}
