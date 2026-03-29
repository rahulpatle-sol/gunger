import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0D0B08',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Red corner accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '6px', background: '#C41E3A',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '6px', background: '#C41E3A',
        }} />

        {/* Top border lines */}
        <div style={{
          position: 'absolute', top: '20px', left: '40px', right: '40px',
          borderTop: '2px solid rgba(244,236,216,0.3)',
          display: 'flex',
        }} />

        {/* Date line */}
        <div style={{
          position: 'absolute', top: '32px', left: '0', right: '0',
          display: 'flex', justifyContent: 'center',
          color: 'rgba(244,236,216,0.5)', fontSize: '14px', letterSpacing: '0.15em',
        }}>
          EST. 2025 ✦ VOLUME I ✦ ISSUE NO. 1
        </div>

        {/* Gun icon */}
        <div style={{
          fontSize: '48px', marginBottom: '20px', display: 'flex',
        }}>🔫</div>

        {/* Title */}
        <div style={{
          fontSize: '120px', fontWeight: '900', color: '#F4ECD8',
          letterSpacing: '-0.02em', lineHeight: '1', display: 'flex',
        }}>
          GUNGER
        </div>

        {/* Rule */}
        <div style={{
          width: '600px', height: '3px',
          background: 'rgba(244,236,216,0.4)',
          margin: '20px 0',
          display: 'flex',
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: '24px', color: '#C41E3A', letterSpacing: '0.2em',
          textTransform: 'uppercase', display: 'flex',
        }}>
          CODE · TEST · DOMINATE
        </div>

        {/* Sub */}
        <div style={{
          fontSize: '16px', color: 'rgba(244,236,216,0.5)',
          marginTop: '16px', letterSpacing: '0.08em', display: 'flex',
        }}>
          The Underground Coding Platform for Junior Devs
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '60px', marginTop: '40px',
          color: '#F4ECD8',
        }}>
          {['Hidden Test Cases', 'XP Leaderboard', 'AI Feedback', 'Multi-Language'].map((stat) => (
            <div key={stat} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <div style={{ width: '8px', height: '8px', background: '#C41E3A', borderRadius: '50%', display: 'flex' }} />
              <div style={{ fontSize: '13px', color: 'rgba(244,236,216,0.6)', display: 'flex' }}>{stat}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
