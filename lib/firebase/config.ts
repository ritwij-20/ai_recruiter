import rawConfig from '@/firebase-applet-config.json';

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

// In AI Studio, rawConfig contains the explicitly provisioned project and database configuration.
// We strictly prioritize rawConfig values to guarantee the browser and backend stay connected to
// the intended Firebase project (ai-recruiter-651a1) and database (ai-studio-airecruiterintel-0d1d73ff-4852-43c3-aca0-4f50b4bb57e6).
const resolvedDatabaseId = 
  rawConfig.firestoreDatabaseId ||
  (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID && process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID !== '(default)'
    ? process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID 
    : 'ai-studio-airecruiterintel-0d1d73ff-4852-43c3-aca0-4f50b4bb57e6');

export const firebaseConfig: FirebaseConfig = {
  projectId: rawConfig.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ai-recruiter-651a1',
  appId: rawConfig.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  apiKey: rawConfig.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: rawConfig.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ai-recruiter-651a1.firebaseapp.com',
  firestoreDatabaseId: resolvedDatabaseId,
  storageBucket: rawConfig.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ai-recruiter-651a1.firebasestorage.app',
  messagingSenderId: rawConfig.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  measurementId: rawConfig.measurementId || '',
  oAuthClientId: rawConfig.oAuthClientId || '',
  recaptchaSiteKey: rawConfig.recaptchaSiteKey || ''
};
