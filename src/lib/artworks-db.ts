'use client';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Artwork } from './types';

const COLLECTION = 'artworks';

export async function fetchArtworks(): Promise<Artwork[]> {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Artwork));
}

export async function fetchArtwork(id: string): Promise<Artwork | null> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const found = snapshot.docs.find((d) => d.data().id === id || d.id === id);
  if (!found) return null;
  return { id: found.data().id || found.id, ...found.data() } as Artwork;
}

export async function uploadImage(file: File, filename: string): Promise<string> {
  const storageRef = ref(storage, `artworks/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch {
    // Image may not exist in storage (old static images)
  }
}

export async function createArtwork(
  data: Omit<Artwork, 'id'> & { id: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateArtwork(
  docId: string,
  data: Partial<Artwork>
): Promise<void> {
  // Find the document by artwork id field
  const snapshot = await getDocs(collection(db, COLLECTION));
  const found = snapshot.docs.find((d) => d.data().id === docId || d.id === docId);
  if (found) {
    await updateDoc(doc(db, COLLECTION, found.id), data);
  }
}

export async function deleteArtwork(artworkId: string): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const found = snapshot.docs.find((d) => d.data().id === artworkId || d.id === artworkId);
  if (found) {
    const data = found.data();
    if (data.image?.startsWith('https://')) {
      await deleteImage(data.image);
    }
    await deleteDoc(doc(db, COLLECTION, found.id));
  }
}
