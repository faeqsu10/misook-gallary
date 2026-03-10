import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export function getClientIp(request: NextRequest): string {
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
  return ip.replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 128);
}

export async function checkRateLimit(
  request: NextRequest,
  prefix: string,
  limitMinutes: number,
): Promise<{ limited: boolean; remainingMinutes: number }> {
  const clientIp = getClientIp(request);
  const rateLimitRef = adminDb.collection('rate_limits').doc(`${prefix}_${clientIp}`);
  const rateLimitDoc = await rateLimitRef.get();

  if (rateLimitDoc.exists) {
    const lastSubmit = rateLimitDoc.data()?.lastSubmit?.toDate();
    if (lastSubmit) {
      const elapsed = Date.now() - lastSubmit.getTime();
      const limitMs = limitMinutes * 60 * 1000;
      if (elapsed < limitMs) {
        const remaining = Math.ceil((limitMs - elapsed) / 60000);
        return { limited: true, remainingMinutes: remaining };
      }
    }
  }

  return { limited: false, remainingMinutes: 0 };
}

export async function recordRateLimit(
  request: NextRequest,
  prefix: string,
): Promise<void> {
  const clientIp = getClientIp(request);
  const rateLimitRef = adminDb.collection('rate_limits').doc(`${prefix}_${clientIp}`);
  await rateLimitRef.set({
    lastSubmit: FieldValue.serverTimestamp(),
    ip: clientIp,
  });
}
