'use client';

import { Artwork } from './types';

const COLLECTION = 'artworks';

async function getFirestoreDb() {
  const { db } = await import('./firebase');
  return db;
}

async function getFirestore() {
  return await import('firebase/firestore');
}

async function getStorage() {
  const { storage } = await import('./firebase');
  const firebaseStorage = await import('firebase/storage');
  return { storage, ...firebaseStorage };
}

export async function fetchArtworks(): Promise<Artwork[]> {
  const db = await getFirestoreDb();
  const { collection, getDocs, orderBy, query } = await getFirestore();
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Artwork));
}

export async function fetchArtwork(id: string): Promise<Artwork | null> {
  const db = await getFirestoreDb();
  const { collection, doc, getDoc, getDocs, where, query } = await getFirestore();

  // 1) Try direct document lookup by Firestore doc ID
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (docSnap.exists()) {
    const data = docSnap.data();
    // If the doc's `id` field matches or the doc has no separate `id` field, use it
    if (!data.id || data.id === id) {
      return { id: data.id || docSnap.id, ...data } as Artwork;
    }
  }

  // 2) Fallback: the artwork `id` field differs from the Firestore doc ID
  const q = query(collection(db, COLLECTION), where('id', '==', id));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const found = snapshot.docs[0];
  return { id: found.data().id || found.id, ...found.data() } as Artwork;
}

export async function uploadImage(file: File, filename: string): Promise<string> {
  const { storage, ref, uploadBytes, getDownloadURL } = await getStorage();
  const storageRef = ref(storage, `artworks/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadEnhancedImage(
  blob: Blob,
  filename: string,
  tier: 'corrected' | 'artEnhanced' = 'corrected'
): Promise<string> {
  const { storage, ref, uploadBytes, getDownloadURL } = await getStorage();
  const storageTier = tier === 'artEnhanced' ? 'art-enhanced' : 'corrected';
  const storageRef = ref(storage, `enhanced/${storageTier}/${filename}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const { storage, ref, deleteObject } = await getStorage();
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch {
    // Image may not exist in storage (old static images)
  }
}

export async function createArtwork(
  data: Omit<Artwork, 'id'> & { id: string }
): Promise<string> {
  const db = await getFirestoreDb();
  const { collection, addDoc } = await getFirestore();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateArtwork(
  docId: string,
  data: Partial<Artwork>
): Promise<void> {
  const db = await getFirestoreDb();
  const { collection, doc, getDoc, getDocs, where, query, updateDoc } = await getFirestore();

  // 1) Try direct document lookup by Firestore doc ID
  const docSnap = await getDoc(doc(db, COLLECTION, docId));
  if (docSnap.exists()) {
    const docData = docSnap.data();
    if (!docData.id || docData.id === docId) {
      await updateDoc(doc(db, COLLECTION, docSnap.id), data);
      return;
    }
  }

  // 2) Fallback: artwork `id` field differs from Firestore doc ID
  const q = query(collection(db, COLLECTION), where('id', '==', docId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    await updateDoc(doc(db, COLLECTION, snapshot.docs[0].id), data);
  }
}

export async function deleteArtwork(artworkId: string): Promise<void> {
  const db = await getFirestoreDb();
  const { collection, doc, getDoc, getDocs, where, query, deleteDoc } = await getFirestore();

  let foundId: string | null = null;
  let foundData: Record<string, unknown> | null = null;

  // 1) Try direct document lookup by Firestore doc ID
  const docSnap = await getDoc(doc(db, COLLECTION, artworkId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (!data.id || data.id === artworkId) {
      foundId = docSnap.id;
      foundData = data;
    }
  }

  // 2) Fallback: artwork `id` field differs from Firestore doc ID
  if (!foundId) {
    const q = query(collection(db, COLLECTION), where('id', '==', artworkId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      foundId = snapshot.docs[0].id;
      foundData = snapshot.docs[0].data();
    }
  }

  if (foundId && foundData) {
    if (typeof foundData.image === 'string' && foundData.image.startsWith('https://')) {
      await deleteImage(foundData.image);
    }
    await deleteDoc(doc(db, COLLECTION, foundId));
  }
}
