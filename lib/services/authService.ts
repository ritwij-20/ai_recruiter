import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { UserProfile, UserRole } from '@/types/recruiter';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: data.uid || data.id || userId,
        uid: data.uid || data.id || userId,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'RECRUITER',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn(`getUserProfile info for path ${path}:`, error);
    return null;
  }
}

export async function createUserProfile(
  userId: string, 
  email: string, 
  name: string, 
  role: UserRole = 'RECRUITER'
): Promise<UserProfile> {
  const path = `users/${userId}`;
  const now = new Date().toISOString();
  const profile = {
    uid: userId,
    id: userId,
    name: name.trim() || email.split('@')[0] || 'Recruiter',
    email: email.trim().toLowerCase(),
    role: role || 'RECRUITER',
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(doc(db, 'users', userId), profile);
    return profile as UserProfile;
  } catch (error) {
    console.warn(`createUserProfile warning for ${path}:`, error);
    return profile as UserProfile;
  }
}

export async function signUpRecruiter(email: string, password: string, name: string): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;
  return await createUserProfile(user.uid, user.email || email, name, 'RECRUITER');
}

export async function signInRecruiter(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;
  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = await createUserProfile(user.uid, user.email || email, user.displayName || 'Recruiter', 'RECRUITER');
  }
  return profile;
}

export async function signInWithGoogle(role: UserRole = 'RECRUITER'): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = await createUserProfile(
      user.uid, 
      user.email || '', 
      user.displayName || 'Recruiter User', 
      role
    );
  }
  return profile;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
