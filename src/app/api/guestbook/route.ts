import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, recordRateLimit } from '@/lib/rate-limit';

const NAME_MAX = 50;
const MESSAGE_MAX = 200;
const RATE_LIMIT_MINUTES = 10;

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
    const { limited, remainingMinutes } = await checkRateLimit(request, 'guestbook', RATE_LIMIT_MINUTES);
    if (limited) {
      return NextResponse.json(
        { error: `잠시 후 다시 시도해주세요. (${remainingMinutes}분 후)` },
        { status: 429 }
      );
    }

    await adminDb.collection('guestbook').add({
      name,
      message,
      approved: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    await recordRateLimit(request, 'guestbook');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({ level: 'ERROR', action: 'guestbook.submit', source: 'server', error: String(err) }));
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
