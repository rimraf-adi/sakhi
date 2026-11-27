import type { ReactNode } from 'react';
import { SANS } from './ScreenChrome';

export type ClinicNavKey = 'escalations' | 'intake' | 'timelines' | 'audit';

interface ClinicShellProps {
  activeNav: ClinicNavKey;
  pageTitle: string;
  pageSubtitle: string;
  alertCount?: number;
  rightHeader?: ReactNode;
  children: ReactNode;
}

const NAV_ITEMS: { key: ClinicNavKey; label: string }[] = [
  { key: 'escalations', label: 'Live escalations' },
  { key: 'intake', label: 'ANC intake' },
  { key: 'timelines', label: 'Patient timelines' },
  { key: 'audit', label: 'Safety audit' },
];

export function ClinicShell({
  activeNav,
  pageTitle,
  pageSubtitle,
  alertCount = 0,
  rightHeader,
  children,
}: ClinicShellProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#F8F9FA',
        color: '#101828',
        fontFamily: SANS,
        overflow: 'hidden',
      }}
    >
      {/* Left Clinical Sidebar */}
      <aside
        style={{
          width: 244,
          flexShrink: 0,
          backgroundColor: '#F3F4F6',
          borderRight: '1px solid #E4E7EC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '18px 14px',
        }}
      >
        <div>
          <div
            style={{
              padding: '0 6px 14px 6px',
              borderBottom: '1px solid #E4E7EC',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#101828',
                }}
              >
                Sakhi Clinical
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0F4C3A',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #ABEFC6',
                  padding: '1px 7px',
                  borderRadius: 6,
                }}
              >
                OPD
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#101828' }}>
              District Women&apos;s Hospital
            </div>
            <div style={{ fontSize: 11.5, color: '#475467', marginTop: 2 }}>
              Antenatal OPD, Ward 2
            </div>
          </div>

          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: '#667085',
              padding: '0 8px',
              marginBottom: 6,
            }}
          >
            Ward workstation
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === activeNav;
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#0F4C3A' : '#344054',
                    border: isActive ? '1px solid #E4E7EC' : '1px solid transparent',
                    borderLeft: isActive ? '3px solid #0F4C3A' : '3px solid transparent',
                  }}
                >
                  <span>{item.label}</span>
                  {item.key === 'escalations' && alertCount > 0 ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '1px 7px',
                        borderRadius: 6,
                        backgroundColor: '#FEF3F2',
                        border: '1px solid #FECDCA',
                        color: '#B42318',
                      }}
                    >
                      {alertCount}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 8,
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#101828' }}>
            Sr. Anita Deshmukh
          </div>
          <div style={{ fontSize: 11.5, color: '#475467', marginTop: 1 }}>
            Staff Nurse, Shift A
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              paddingTop: 7,
              borderTop: '1px solid #E4E7EC',
              fontSize: 11,
              fontWeight: 600,
              color: '#0F4C3A',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                backgroundColor: '#0F4C3A',
              }}
            />
            RCH sync online
          </div>
        </div>
      </aside>

      {/* Main Clinical Workspace */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            height: 56,
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E4E7EC',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15.5,
                fontWeight: 600,
                color: '#101828',
                letterSpacing: '-0.01em',
              }}
            >
              {pageTitle}
            </div>
            <div style={{ fontSize: 12, color: '#475467' }}>{pageSubtitle}</div>
          </div>
          {rightHeader ? <div>{rightHeader}</div> : null}
        </header>

        <main
          style={{
            flex: 1,
            padding: '18px 24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
