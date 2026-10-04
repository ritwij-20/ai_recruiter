import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Singleton initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database instance explicitly passing firestoreDatabaseId (Required)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Auth instance
export const auth = getAuth(app);

// Connectivity validation helper
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection pending:', error.message);
    }
    return false;
  }
}

