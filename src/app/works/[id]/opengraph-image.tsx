import { ImageResponse } from 'next/og';
import { getArtwork } from '@/data/artworks';
import { artist } from '@/data/artist';

export const runtime = 'edge';
export const alt = '정미숙 갤러리';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtwork(id);

  const title = artwork?.title ?? '작품';
  const titleEn = artwork?.titleEn ?? '';

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

        {/* Artist name (small, top) */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            fontSize: '16px',
            fontWeight: '400',
            color: '#6B6B6B',
            letterSpacing: '0.2em',
          }}
        >
          정미숙
        </div>

        {/* Artwork title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: '700',
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* English title */}
        {titleEn && (
          <div
            style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#6B6B6B',
              letterSpacing: '0.08em',
              marginBottom: '48px',
            }}
          >
            {titleEn}
          </div>
        )}

        {/* Divider dot */}
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#6B6B6B',
            marginTop: titleEn ? '0px' : '28px',
            marginBottom: '28px',
          }}
        />

        {/* Gallery label */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: '400',
            color: '#6B6B6B',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          {artist.nameEn} Gallery
        </div>
      </div>
    ),
    { ...size }
  );
}
