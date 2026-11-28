'use client';

import { useCallback, useEffect, useState } from 'react';

interface PatientRecord {
  id: string;
  name: string;
  gestationWeek: number;
  language: 'Hindi' | 'Marathi' | 'Tamil' | 'Telugu' | 'English';
  nextVisitLabel: string;
  ashaName: string;
  familyName: string;
  createdAt: string;
}

interface EscalationAlert {
  id: string;
  patientId: string;
  patientName: string;
  gestationWeek: number;
  language: string;
  severity: 'red' | 'amber' | 'green';
  symptomSummary: string;
  transcriptSnippet: string;
  ruleMatched: string;
  notifiedRecipients: string[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  detail: string;
  verifiedByDoctor?: boolean;
  reviewedBy?: string;
}

interface ConversationMessage {
  id: number;
  role: string;
  body: string;
  createdAt: string;
}

interface ConversationView {
  id: string;
  patient_name: string;
  language: string;
  action: string | null;
  status: string;
  updated_at: string;
  messages: ConversationMessage[];
}

interface DashboardPayload {
  patients: PatientRecord[];
  alerts: EscalationAlert[];
  auditLogs: AuditLogEntry[];
  conversations?: ConversationView[];
}

type NavTab = 'escalations' | 'intake' | 'timelines' | 'audit';

export default function ClinicDashboardPage() {
  const [data, setData] = useState<DashboardPayload>({
    patients: [],
    alerts: [],
    auditLogs: [],
  });
  const [activeTab, setActiveTab] = useState<NavTab>('escalations');
  const [name, setName] = useState('');
  const [gestationWeek, setGestationWeek] = useState('32');
  const [lmpDate, setLmpDate] = useState('2026-04-16');
  const [language, setLanguage] = useState<'Hindi' | 'Marathi' | 'Tamil' | 'Telugu' | 'English'>('Hindi');
  const [nextVisitLabel, setNextVisitLabel] = useState('');
  const [ashaName, setAshaName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [supplementName, setSupplementName] = useState('');
  const [supplementDaysTotal, setSupplementDaysTotal] = useState('28');
  const [submitting, setSubmitting] = useState(false);
  const [intakeSavedBanner, setIntakeSavedBanner] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as DashboardPayload;
      setData(json);
    } catch {
      // Ignore transient polling errors during dev reload
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    const timer = setInterval(() => {
      void fetchDashboard();
    }, 2000);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setIntakeSavedBanner(null);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gestationWeek: Number(gestationWeek) || 32,
          language,
          nextVisitLabel,
          ashaName,
          familyName,
          supplementName,
          supplementDaysTotal: Number(supplementDaysTotal) || 28,
        }),
      });
      if (res.ok) {
        const savedName = name.trim();
        setName('');
        setIntakeSavedBanner(`Registered ${savedName} (Week ${gestationWeek}). Sakhi Voice Companion armed.`);
        await fetchDashboard();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAcknowledge(alertId: string) {
    await fetch(`/api/alerts/${alertId}/ack`, { method: 'POST' });
    await fetchDashboard();
  }

  async function handleReview(logId: string, verified: boolean) {
    await fetch(`/api/audit/${logId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    });
    await fetchDashboard();
  }

  async function handleReset() {
    await fetch('/api/reset', { method: 'POST' });
    await fetchDashboard();
  }

  const activeAlerts = data.alerts.filter((a) => !a.acknowledged);
  const redAlerts = activeAlerts.filter((a) => a.severity === 'red');
  const latestAlert = data.alerts[0];

  const navItems: { key: NavTab; label: string; badge?: number }[] = [
    { key: 'escalations', label: 'Live escalations', badge: redAlerts.length },
    { key: 'intake', label: 'ANC intake' },
    { key: 'timelines', label: 'Patient timelines' },
    { key: 'audit', label: 'Safety audit' },
  ];

  const pageMeta: Record<NavTab, { title: string; subtitle: string }> = {
    escalations: {
      title: 'Escalations and pre-visit timeline',
      subtitle: 'Real-time clinical alerts from home voice check-ins under MoHFW guidelines',
    },
    intake: {
      title: 'New ANC intake',
      subtitle: 'Hospital-owned record registered once at OPD desk',
    },
    timelines: {
      title: 'Registered ANC cohort',
      subtitle: "Active patients synced between District Women's Hospital and Sakhi mobile",
    },
    audit: {
      title: 'Clinical safety audit',
      subtitle: 'Every home voice exchange and escalation logged for clinician review',
    },
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#101828]">
      {/* Left Clinical Sidebar */}
      <aside className="flex w-[244px] shrink-0 flex-col justify-between border-r border-[#E4E7EC] bg-[#F3F4F6] px-3.5 py-4">
        <div>
          <div className="mb-3.5 border-b border-[#E4E7EC] px-1.5 pb-3.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-base font-bold tracking-tight text-[#101828]">
                Sakhi Clinical
              </span>
              <span className="rounded-md border border-[#ABEFC6] bg-[#ECFDF3] px-1.5 py-0.5 text-[11px] font-semibold text-[#0F4C3A]">
                OPD
              </span>
            </div>
            <div className="text-[12.5px] font-semibold text-[#101828]">
              District Women&apos;s Hospital
            </div>
            <div className="mt-0.5 text-[11.5px] text-[#475467]">
              Antenatal OPD, Ward 2
            </div>
          </div>

          <div className="mb-1.5 px-2 text-[11.5px] font-semibold text-[#667085]">
            Ward workstation
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center justify-between rounded-md border px-2.5 py-2 text-left text-[13px] transition ${
                    isActive
                      ? 'border-[#E4E7EC] border-l-[3px] border-l-[#0F4C3A] bg-white font-semibold text-[#0F4C3A]'
                      : 'border-transparent font-medium text-[#344054] hover:bg-white/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-1.5 py-0.5 text-[11px] font-semibold text-[#B42318]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-lg border border-[#E4E7EC] bg-white p-3">
          <div className="text-[12.5px] font-semibold text-[#101828]">Sr. Anita Deshmukh</div>
          <div className="mt-0.5 text-[11.5px] text-[#475467]">Staff Nurse, Shift A</div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-[#E4E7EC] pt-2 text-[11px] font-semibold text-[#0F4C3A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F4C3A]" />
            RCH sync online
          </div>
        </div>
      </aside>

      {/* Main Clinical Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#E4E7EC] bg-white px-6 py-2">
          <div className="min-w-0">
            <h1 className="text-[15.5px] font-semibold tracking-tight text-[#101828]">
              {pageMeta[activeTab].title}
            </h1>
            <p className="text-xs text-[#475467]">{pageMeta[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[#E4E7EC] bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#E4E7EC]/60"
            >
              Open patient mobile
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-medium text-[#475467] hover:bg-[#F8F9FA]"
            >
              Reset demo
            </button>
            {activeTab !== 'intake' && (
              <button
                type="button"
                onClick={() => setActiveTab('intake')}
                className="rounded-md bg-[#101828] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D2939]"
              >
                New ANC intake
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === 'escalations' && (
            <div className="space-y-4">
              {(data.conversations ?? []).length > 0 && (
                <section className="rounded-lg border border-[#E4E7EC] bg-white">
                  <header className="flex items-center justify-between border-b border-[#E4E7EC] px-4 py-2.5">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Live from Sakhi voice
                    </span>
                    <span className="text-[11.5px] text-[#667085]">
                      {(data.conversations ?? []).length} conversation
                      {(data.conversations ?? []).length === 1 ? '' : 's'} · synced from Postgres
                    </span>
                  </header>
                  <div className="divide-y divide-[#F2F4F7]">
                    {(data.conversations ?? []).slice(0, 3).map((conversation) => (
                      <article key={conversation.id} className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12.5px] font-semibold text-[#101828]">
                            {conversation.patient_name}
                            <span className="ml-2 font-normal text-[#667085]">
                              {conversation.language} ·{' '}
                              {new Date(conversation.updated_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                              conversation.action === 'alert'
                                ? 'bg-[#FEF3F2] text-[#B42318]'
                                : 'bg-[#ECFDF3] text-[#027A48]'
                            }`}
                          >
                            {conversation.action === 'alert' ? 'Escalated' : 'Saved to timeline'}
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {conversation.messages.slice(-4).map((message) => (
                            <p key={message.id} className="text-[12px] leading-snug text-[#344054]">
                              <span
                                className={`mr-1.5 font-semibold ${
                                  message.role === 'sakhi' ? 'text-[#0F4C3A]' : 'text-[#667085]'
                                }`}
                              >
                                {message.role === 'sakhi' ? 'Sakhi' : 'Mother'}
                              </span>
                              {message.body}
                            </p>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Hairline-Divided Metric Bar */}
              <div className="grid grid-cols-2 divide-x divide-[#E4E7EC] rounded-lg border border-[#E4E7EC] bg-white md:grid-cols-4">
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Urgent alerts</div>
                  <div
                    className={`mt-0.5 text-2xl font-bold ${
                      redAlerts.length > 0 ? 'text-[#B42318]' : 'text-[#0F4C3A]'
                    }`}
                  >
                    {redAlerts.length}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">
                    {redAlerts.length > 0 ? 'Immediate call required' : 'All urgent alerts acknowledged'}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Registered cohort</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#101828]">
                    {data.patients.length}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">
                    District Women&apos;s Hospital
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Response under 2 hours</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#0F4C3A]">94%</div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">
                    Care team and hospital staff
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Unacknowledged</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#101828]">0</div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">Over 15 minutes</div>
                </div>
              </div>

              {/* Triage Queue + Pre-Visit Timeline */}
              <div className="grid gap-4 lg:grid-cols-[1.42fr_1fr]">
                <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E4E7EC] px-4 py-2.5">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Triage queue
                    </span>
                    <span className="text-[11.5px] text-[#667085]">
                      Syncs with Sakhi mobile every 2s
                    </span>
                  </div>

                  {data.alerts.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#475467]">
                      No escalations yet. Speak a symptom on Patient Mobile (localhost:3001) to trigger a live triage alert.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E4E7EC]">
                      {data.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`border-l-[3px] p-4 ${
                            alert.acknowledged
                              ? 'border-l-[#0F4C3A] bg-white'
                              : alert.severity === 'red'
                                ? 'border-l-[#B42318] bg-[#FFFCFB]'
                                : 'border-l-[#B54708] bg-white'
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                                  alert.acknowledged
                                    ? 'border-[#ABEFC6] bg-[#ECFDF3] text-[#0F4C3A]'
                                    : alert.severity === 'red'
                                      ? 'border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]'
                                      : 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]'
                                }`}
                              >
                                {alert.acknowledged
                                  ? 'Acknowledged'
                                  : alert.severity === 'red'
                                    ? 'Urgent'
                                    : 'Follow-up'}
                              </span>
                              <span className="text-[13.5px] font-semibold text-[#101828]">
                                {alert.patientName}
                              </span>
                              <span className="text-xs text-[#475467]">
                                Week {alert.gestationWeek}, {alert.language}
                              </span>
                            </div>
                            <span className="text-[11.5px] text-[#667085]">
                              {new Date(alert.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="mb-3 text-[12.5px] leading-relaxed text-[#344054]">
                            <strong className="text-[#101828]">{alert.symptomSummary}:</strong> &ldquo;{alert.transcriptSnippet}&rdquo;
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                              {alert.notifiedRecipients.map((recipient) => (
                                <span
                                  key={recipient}
                                  className="rounded-md border border-[#E4E7EC] bg-[#F3F4F6] px-2 py-1 font-medium text-[#344054]"
                                >
                                  {recipient}
                                </span>
                              ))}
                            </div>

                            {alert.acknowledged ? (
                              <div className="text-right">
                                <span className="rounded-md bg-[#0F4C3A] px-3 py-1.5 text-xs font-semibold text-white">
                                  {alert.acknowledgedBy || 'Nurse acknowledged'}
                                </span>
                                <div className="mt-1 text-[10.5px] font-medium text-[#0F4C3A]">
                                  Her phone shows &ldquo;seen&rdquo;
                                  {alert.acknowledgedAt
                                    ? ` at ${new Date(alert.acknowledgedAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}`
                                    : ''}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAcknowledge(alert.id)}
                                className="rounded-md bg-[#101828] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D2939]"
                              >
                                Acknowledge and call
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Clinical Handoff & Timeline */}
                <div className="flex flex-col justify-between rounded-lg border border-[#E4E7EC] bg-white p-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[14.5px] font-bold text-[#101828]">
                        {latestAlert
                          ? `Pre-visit timeline: ${latestAlert.patientName}`
                          : 'Pre-visit timeline'}
                      </div>
                      <span className="text-[11.5px] text-[#475467]">
                        {latestAlert ? `Week ${latestAlert.gestationWeek}` : ''}
                      </span>
                    </div>
                    <div className="mb-3 mt-0.5 text-xs text-[#475467]">
                      {latestAlert
                        ? `Language: ${latestAlert.language}, zero diagnoses generated`
                        : 'Select or trigger a voice check-in to inspect clinical handoff'}
                    </div>

                    {latestAlert && (
                      <div className="mb-3.5 rounded-md border border-[#FECDCA] bg-[#FEF3F2] p-2.5">
                        <div className="text-[11.5px] font-semibold text-[#B42318]">
                          Matched MoHFW protocol: {latestAlert.ruleMatched}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {data.auditLogs.slice(0, 6).map((log) => (
                        <div key={log.id} className="border-l-2 border-[#0F4C3A] pl-2.5 text-xs">
                          <div className="flex justify-between text-[11px] text-[#667085]">
                            <span className="font-semibold text-[#0F4C3A]">{log.event}</span>
                            <span>
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[#344054]">{log.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-[#E4E7EC] pt-2.5 text-[11.5px] text-[#475467]">
                    <span>Zero diagnoses generated</span>
                    <span className="font-semibold text-[#0F4C3A]">Hospital-owned record</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intake' && (
            <div className="grid gap-4 lg:grid-cols-[1.58fr_1fr]">
              <form
                onSubmit={handleRegister}
                className="flex flex-col justify-between rounded-lg border border-[#E4E7EC] bg-white p-5"
              >
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Patient and gestation
                    </span>
                    <span className="text-[11.5px] text-[#667085]">MoHFW ANC card sync</span>
                  </div>

                  <div className="mb-3 grid gap-2.5 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        RCH ID
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="RCH-2026-048192"
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-[#F8F9FA] px-2.5 font-mono text-xs font-medium text-[#101828]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Patient full name
                      </label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Patient full name"
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Gestation week
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={42}
                        value={gestationWeek}
                        onChange={(e) => setGestationWeek(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Last menstrual period
                      </label>
                      <input
                        type="date"
                        value={lmpDate}
                        onChange={(e) => setLmpDate(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Calculated stage
                      </label>
                      <div className="flex h-9 items-center rounded-md border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 text-[13px] font-medium text-[#0F4C3A]">
                        Week {gestationWeek || 32}, Trimester {Number(gestationWeek) >= 28 ? 3 : Number(gestationWeek) >= 14 ? 2 : 1}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2.5 flex items-center justify-between border-t border-[#E4E7EC] pt-4">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Voice companion and escalation routing
                    </span>
                    <span className="text-[11.5px] text-[#667085]">Zero-typing home follow-up</span>
                  </div>

                  <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Spoken language
                      </label>
                      <select
                        value={language}
                        onChange={(e) =>
                          setLanguage(
                            e.target.value as 'Hindi' | 'Marathi' | 'Tamil' | 'Telugu' | 'English',
                          )
                        }
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      >
                        <option value="Hindi">Hindi (voice only)</option>
                        <option value="Marathi">Marathi (voice only)</option>
                        <option value="Tamil">Tamil (voice only)</option>
                        <option value="Telugu">Telugu (voice only)</option>
                        <option value="English">English (voice only)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Next ANC visit
                      </label>
                      <input
                        type="text"
                        value={nextVisitLabel}
                        onChange={(e) => setNextVisitLabel(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Assigned health professional
                      </label>
                      <input
                        type="text"
                        value={ashaName}
                        onChange={(e) => setAshaName(e.target.value)}
                        placeholder="ASHA / ANM name"
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Family escalation contact
                      </label>
                      <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Name (relation)"
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div className="mb-4 grid gap-2.5 sm:grid-cols-[1.6fr_1fr]">
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Daily care item to track
                      </label>
                      <input
                        type="text"
                        value={supplementName}
                        onChange={(e) => setSupplementName(e.target.value)}
                        placeholder="e.g. Iron + folic acid"
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11.5px] font-semibold text-[#344054]">
                        Course length (days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={supplementDaysTotal}
                        onChange={(e) => setSupplementDaysTotal(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white px-2.5 text-[13px] font-medium text-[#101828] outline-none focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div className="mb-2.5 flex items-center justify-between border-t border-[#E4E7EC] pt-4">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Baseline vitals
                    </span>
                    <span className="text-[11.5px] text-[#667085]">Recorded at ANC OPD triage</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      ['Blood pressure', '118/76 mmHg'],
                      ['Hemoglobin', '10.8 g/dL'],
                      ['Blood group', 'O+ positive'],
                      [
                        supplementName.trim() || 'Daily care item',
                        `0 of ${supplementDaysTotal || 28} days`,
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-md border border-[#E4E7EC] bg-[#F8F9FA] px-2.5 py-2">
                        <div className="text-[11px] text-[#475467]">{k}</div>
                        <div className="mt-0.5 text-[13px] font-semibold text-[#101828]">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E7EC] pt-4">
                  <div className="text-xs text-[#475467]">
                    {intakeSavedBanner ? (
                      <span className="font-semibold text-[#0F4C3A]">{intakeSavedBanner}</span>
                    ) : (
                      'Patient receives one-tap voice link, no login required'
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-[#101828] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D2939] disabled:opacity-60"
                  >
                    {submitting ? 'Registering...' : 'Register and activate'}
                  </button>
                </div>
              </form>

              <div className="flex flex-col justify-between rounded-lg border border-[#E4E7EC] bg-white p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#101828]">
                      Voice companion profile
                    </span>
                    <span className="rounded-md border border-[#E4E7EC] bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#475467]">
                      Draft
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#101828]">
                    {name.trim() || 'New ANC patient'}
                  </div>
                  <div className="mb-3 mt-0.5 text-xs text-[#475467]">
                    Week {gestationWeek || 32}, LMP {lmpDate}
                  </div>

                  <div className="mb-4 overflow-hidden rounded-md border border-[#E4E7EC] text-xs">
                    {[
                      ['Voice channel', language],
                      ['Next ANC visit', nextVisitLabel || 'Not set'],
                      ['Care escalation', ashaName || 'ASHA worker'],
                      ['Family alert', familyName || 'Family contact'],
                      ['Daily care item', supplementName || 'Daily supplement'],
                    ].map(([k, v], idx) => (
                      <div
                        key={k}
                        className={`flex justify-between px-2.5 py-2 ${
                          idx > 0 ? 'border-t border-[#E4E7EC]' : ''
                        } ${idx % 2 === 0 ? 'bg-[#F8F9FA]' : 'bg-white'}`}
                      >
                        <span className="text-[#475467]">{k}</span>
                        <span className="font-semibold text-[#101828]">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-2 text-[12.5px] font-semibold text-[#101828]">
                    Active protocol checks
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#344054]">
                    <li>• Pre-eclampsia triad watch (headache, swelling, vision)</li>
                    <li>• Reduced fetal movement trigger</li>
                    <li>• Single clarifying voice question limit</li>
                    <li>• Two-minute escalation to care team and family</li>
                  </ul>
                </div>

                <div className="mt-4 flex justify-between border-t border-[#E4E7EC] pt-3 text-[11.5px] text-[#475467]">
                  <span>Hospital-owned EHR record</span>
                  <span className="font-semibold text-[#0F4C3A]">Syncs to localhost:3001</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timelines' && (
            <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
              <div className="border-b border-[#E4E7EC] px-4 py-3 text-[13px] font-semibold text-[#101828]">
                Registered ANC cohort ({data.patients.length})
              </div>
              <div className="divide-y divide-[#E4E7EC]">
                {data.patients.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-[#101828]">
                        {p.name} <span className="font-normal text-[#475467]">(Week {p.gestationWeek})</span>
                      </div>
                      <div className="mt-0.5 text-xs text-[#475467]">
                        Language: {p.language}, {p.nextVisitLabel}, Care team: {p.ashaName}, Family: {p.familyName}
                      </div>
                    </div>
                    <span className="rounded-md border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#0F4C3A]">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 divide-y divide-[#E4E7EC] rounded-lg border border-[#E4E7EC] bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Missed danger signs (sampled)</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#0F4C3A]">0 missed</div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">Target: 0 missed across monthly doctor reviews</div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Human response under 2 hours</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#B54708]">94% (9 in 10+)</div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">Danger alerts answered by health professional or hospital staff</div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[#475467]">Record ownership</div>
                  <div className="mt-0.5 text-2xl font-bold text-[#101828]">Hospital-owned</div>
                  <div className="mt-0.5 text-[11.5px] text-[#667085]">Zero third-party sharing, consent-only research</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
                <div className="flex items-center justify-between border-b border-[#E4E7EC] px-4 py-3">
                  <span className="text-[13px] font-semibold text-[#101828]">
                    Audited voice exchanges
                  </span>
                  <span className="text-[11.5px] text-[#475467]">
                    Every check-in logged for clinician review
                  </span>
                </div>
                <div className="grid grid-cols-[110px_140px_1fr_110px] gap-3 border-b border-[#E4E7EC] bg-[#F8F9FA] px-4 py-2 text-[11.5px] font-semibold text-[#475467]">
                  <span>Timestamp</span>
                  <span>Actor</span>
                  <span>Clinical event and detail</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-[#E4E7EC]">
                  {data.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-[110px_140px_1fr_110px] items-center gap-3 px-4 py-3 text-xs"
                    >
                      <span className="font-mono text-[#475467]">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-semibold text-[#101828]">{log.actor}</span>
                      <span className="text-[#344054]">
                        <strong className="text-[#101828]">{log.event}:</strong> {log.detail}
                      </span>
                      <div className="flex justify-end">
                        {log.verifiedByDoctor ? (
                          <button
                            type="button"
                            onClick={() => handleReview(log.id, false)}
                            title={log.reviewedBy ? `Reviewed by ${log.reviewedBy}` : 'Reviewed'}
                            className="rounded-md border border-[#ABEFC6] bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-semibold text-[#0F4C3A] hover:bg-[#D1FADF]"
                          >
                            Verified
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReview(log.id, true)}
                            className="rounded-md border border-[#D0D5DD] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#475467] hover:bg-[#F3F4F6]"
                          >
                            Mark reviewed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
