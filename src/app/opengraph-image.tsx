import { ImageResponse } from 'next/og';

export const alt = 'Vilabia — Logopedia online y ejercicios de lectura labial gratis';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const dynamic = 'force-static';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        padding: 96,
        background: 'linear-gradient(135deg, #d7eff1 0%, #addddd 100%)',
        color: '#0e2a36',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: '#4eafb2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          V
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Vilabia</div>
      </div>
      <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
        Aprende a leer los labios jugando
      </div>
      <div style={{ fontSize: 34, color: '#5b717a' }}>
        Ejercicios de logopedia online gratuitos · lectura labial · pérdida auditiva
      </div>
    </div>,
    { ...size },
  );
}
