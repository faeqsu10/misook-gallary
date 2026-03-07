'use client';

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const DAILY_LIMIT = Number(process.env.NEXT_PUBLIC_ENHANCE_DAILY_LIMIT) || 1;
const COLLECTION = 'enhance_logs';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkDailyLimit(): Promise<{
  allowed: boolean;
  used: number;
}> {
  const today = todayKey();
  const q = query(collection(db, COLLECTION), where('date', '==', today));
  const snapshot = await getDocs(q);
  return { allowed: snapshot.size < DAILY_LIMIT, used: snapshot.size };
}

export async function recordEnhancement(artworkId: string): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    date: todayKey(),
    artworkId,
    createdAt: new Date().toISOString(),
  });
}

export async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function callEnhanceApi(
  imageBase64: string,
  mimeType: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const response = await fetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '보정 요청에 실패했습니다.');
  }

  return response.json();
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}
