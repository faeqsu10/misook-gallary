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

const MAX_DIMENSION = 1024;

export async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // Resize if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context 생성 실패'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });

      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(blob);
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
