import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const NAME_MAX = 50;
const MESSAGE_MAX = 200;
const RATE_LIMIT_MINUTES = 10;

function getClientIp(request: NextRequest): string {
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
  return ip.replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 128);
}

// GET: fetch approved entries
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('guestbook')
      .where('approved', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      message: doc.data().message,
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error(JSON.stringify({ level: 'ERROR', action: 'guestbook.list', source: 'server', error: String(err) }));
    return NextResponse.json({ entries: [] });
  }
}

// POST: submit new entry (pending approval)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { honeypot } = body;
    const name = String(body.name ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!name || !message) {
      return NextResponse.json({ error: '이름과 메시지를 입력해주세요.' }, { status: 400 });
    }

    if (name.length > NAME_MAX) {
      return NextResponse.json({ error: `이름은 ${NAME_MAX}자 이하로 입력해주세요.` }, { status: 400 });
    }

    if (message.length > MESSAGE_MAX) {
      return NextResponse.json({ error: `메시지는 ${MESSAGE_MAX}자 이하로 입력해주세요.` }, { status: 400 });
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitRef = adminDb.collection('rate_limits').doc(`guestbook_${clientIp}`);
    const rateLimitDoc = await rateLimitRef.get();

    if (rateLimitDoc.exists) {
      const lastSubmit = rateLimitDoc.data()?.lastSubmit?.toDate();
      if (lastSubmit) {
        const elapsed = Date.now() - lastSubmit.getTime();
        const limitMs = RATE_LIMIT_MINUTES * 60 * 1000;
        if (elapsed < limitMs) {
          const remaining = Math.ceil((limitMs - elapsed) / 60000);
          return NextResponse.json(
            { error: `잠시 후 다시 시도해주세요. (${remaining}분 후)` },
            { status: 429 }
          );
        }
      }
    }

    await adminDb.collection('guestbook').add({
      name,
      message,
      approved: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    await rateLimitRef.set({
      lastSubmit: FieldValue.serverTimestamp(),
      ip: clientIp,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({ level: 'ERROR', action: 'guestbook.submit', source: 'server', error: String(err) }));
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
