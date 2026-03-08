import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '정미숙 갤러리 — 선과 형태의 언어';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '80px',
            right: '80px',
            height: '1px',
            background: '#1A1A1A',
          }}
        />

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '80px',
            right: '80px',
            height: '1px',
            background: '#1A1A1A',
          }}
        />

        {/* Artist name */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: '700',
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '28px',
          }}
        >
          정미숙
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: '400',
            color: '#6B6B6B',
            letterSpacing: '0.12em',
            marginBottom: '48px',
          }}
        >
          선과 형태의 언어
        </div>

        {/* Divider dot */}
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#1A1A1A',
            marginBottom: '28px',
          }}
        />

        {/* English name */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: '400',
            color: '#6B6B6B',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Jeong Misook
        </div>
      </div>
    ),
    { ...size }
  );
}
