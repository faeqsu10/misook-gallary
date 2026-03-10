import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, recordRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_MINUTES = 5;
const NAME_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 5000;
const VALID_TYPES = ['purchase', 'exhibit', 'support'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, type, artwork, message, honeypot } = body;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: '올바르지 않은 문의 유형입니다.' },
        { status: 400 }
      );
    }

    if (name.length > NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `이름은 ${NAME_MAX_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      );
    }

    if (message.length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `메시지는 ${MESSAGE_MAX_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Server-side rate limiting by IP
    const { limited, remainingMinutes } = await checkRateLimit(request, 'inquiry', RATE_LIMIT_MINUTES);
    if (limited) {
      return NextResponse.json(
        { error: `잠시 후 다시 시도해주세요. (${remainingMinutes}분 후)` },
        { status: 429 }
      );
    }

    // Save inquiry
    await adminDb.collection('inquiries').add({
      name,
      email,
      type,
      artwork: artwork || '',
      message,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update rate limit
    await recordRateLimit(request, 'inquiry');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({
      level: 'ERROR',
      action: 'inquiry.submit',
      source: 'server',
      error: String(err),
    }));
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
