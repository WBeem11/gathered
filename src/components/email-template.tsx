import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  const green = '#2D5A27';
  const sage = '#7A9E7E';
  const grey = '#6B7280';
  const lightGrey = '#9CA3AF';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#F5F7F5', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        {/* Logo icon */}
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: sage,
          borderRadius: '16px',
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Church/house with cross SVG inline */}
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <polygon points="24,6 40,20 40,42 8,42 8,20" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            <line x1="24" y1="22" x2="24" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="28" x2="30" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ color: green, fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Gathered</h1>
        <p style={{ color: sage, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', margin: 0, fontWeight: '600' }}>
          Twin Cities Christian Community
        </p>
      </div>

      {/* Green accent line */}
      <div style={{ height: '3px', background: `linear-gradient(to right, ${green}, ${sage})`, marginBottom: '32px', borderRadius: '2px' }} />

      {/* Body card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 2px 12px rgba(45,90,39,0.08)' }}>
        <h2 style={{ color: green, fontSize: '22px', fontWeight: '700', marginTop: 0, marginBottom: '12px' }}>
          Welcome, {firstName}! 👋
        </h2>
        <p style={{ color: '#374151', lineHeight: '1.7', fontSize: '15px', margin: '0 0 16px' }}>
          We&apos;re so glad you&apos;re here. Gathered connects the Twin Cities Christian community — to encourage one another,
          find local churches, join small groups, and share resources.
        </p>
        <p style={{ color: grey, lineHeight: '1.7', fontSize: '14px', margin: '0 0 20px' }}>
          Here&apos;s what you can explore:
        </p>

        {/* Feature list */}
        {[
          { emoji: '📖', label: 'Feed', desc: 'Share posts and encouragement with your neighbors' },
          { emoji: '🙏', label: 'Prayer', desc: 'Request and offer prayer in your community' },
          { emoji: '⛪', label: 'Churches', desc: 'Discover gospel-centered churches in the Twin Cities' },
          { emoji: '👥', label: 'Groups', desc: 'Join or start a small group near you' },
          { emoji: '🏪', label: 'Businesses', desc: 'Find trusted Christian-owned local businesses' },
        ].map(({ emoji, label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{emoji}</div>
            <div>
              <span style={{ fontWeight: '600', color: green, fontSize: '14px' }}>{label}</span>
              <span style={{ color: grey, fontSize: '14px' }}> — {desc}</span>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <a
            href="https://gathered.vercel.app"
            style={{
              backgroundColor: green,
              color: '#ffffff',
              padding: '13px 36px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '15px',
              display: 'inline-block',
              letterSpacing: '0.2px',
            }}
          >
            Open Gathered →
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <p style={{ color: lightGrey, fontSize: '12px', margin: 0 }}>
          © 2026 Gathered · Serving the Twin Cities Metro
        </p>
        <p style={{ color: lightGrey, fontSize: '11px', marginTop: '4px' }}>
          You&apos;re receiving this because you signed up at gathered.vercel.app
        </p>
      </div>
    </div>
  );
}
