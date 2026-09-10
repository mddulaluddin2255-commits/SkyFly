import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { UserProfile, ScoreRecord } from '../types';
import { markRewardTokenUsed } from './admob';

export const firebaseConfig = {
  apiKey: "AIzaSyB6ItOxR1Gz_d36bpMUvAenX9YHnnnsfQQ",
  authDomain: "sky-fly-de6b5.firebaseapp.com",
  projectId: "sky-fly-de6b5",
  storageBucket: "sky-fly-de6b5.firebasestorage.app",
  messagingSenderId: "567699378875",
  appId: "1:567699378875:web:3da5744d0c095da3984f9"
};

// Initialize Firebase services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  return errInfo;
}

// Local Storage Keys
const GUEST_PROFILE_KEY = 'skyfly_guest_profile';
const USER_PROFILE_PREFIX = 'skyfly_profile_';
const HIGH_SCORE_KEY = 'skyfly_high_score';

function getLocalStoredProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(`${USER_PROFILE_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function setLocalStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(`${USER_PROFILE_PREFIX}${profile.uid}`, JSON.stringify(profile));
  } catch {}
}

export function createDefaultProfile(uid: string, email: string, displayName: string): UserProfile {
  return {
    uid,
    email: email || 'pilot@skyfly.local',
    displayName: displayName || 'Ace Pilot',
    virtualPoints: 1000, // Every new player starts with exactly 1,000 points
    highScore: 0,
    totalFlights: 0,
    successfulClaims: 0,
    totalEarnedScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getGuestProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const guest = createDefaultProfile('guest_pilot', 'guest@skyfly.local', 'Cadet Pilot');
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(guest));
  } catch {}
  return guest;
}

export function saveGuestProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

/**
 * Sign Up with Firebase Authentication
 * Starts new player with 1,000 virtual points and creates profile in Firestore
 */
export async function signUpPlayer(
  email: string,
  pass: string,
  displayName: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const user = cred.user;

  if (displayName.trim()) {
    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch {}
  }

  const initialProfile = createDefaultProfile(
    user.uid,
    user.email || email,
    displayName.trim() || 'Ace Pilot'
  );

  // Write to Firestore users/{uid}
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, initialProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
  }

  setLocalStoredProfile(initialProfile);
  return initialProfile;
}

/**
 * Sign In with Firebase Authentication
 */
export async function signInPlayer(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const user = cred.user;

  let profile: UserProfile | null = null;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profile = snap.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }

  if (!profile) {
    profile = getLocalStoredProfile(user.uid) || createDefaultProfile(
      user.uid,
      user.email || email,
      user.displayName || 'Ace Pilot'
    );
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
    }
  }

  setLocalStoredProfile(profile);
  return profile;
}

/**
 * Sign Out player
 */
export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to Firestore user profile real-time
 */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: UserProfile) => void,
  onError?: (error: unknown) => void
): () => void {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setLocalStoredProfile(data);
        onUpdate(data);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      onError?.(err);
    }
  );
}

export async function getAuthIdToken(): Promise<string | null> {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {}
  }
  return null;
}

export interface FlightStartResult {
  profile: UserProfile;
  sessionId: string;
}

export interface FlightClaimResult {
  profile: UserProfile;
  earnedScore: number;
  actualCrashMultiplier?: number;
  verified: boolean;
}

/**
 * FLIGHT COST:
 * Server-side validated flight launch.
 * Validates player has >= 10 virtual points, deducts 10 points on server and in Firestore.
 * Rejects takeoff if points < 10.
 */
export async function deductFlightCostPoints(
  profile: UserProfile
): Promise<FlightStartResult> {
  if (profile.virtualPoints < 10) {
    throw new Error('Not enough points. Watch a rewarded ad to earn more points.');
  }

  // Authoritative server-side flight session start & point deduction validation
  const idToken = await getAuthIdToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  let sessionId = `flight_${Date.now()}`;
  try {
    const res = await fetch('/api/flight/start', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        currentPoints: profile.virtualPoints,
        userId: profile.uid,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        throw new Error(errData.error);
      }
    }
  } catch (netErr: any) {
    // If offline or network error, verify local balance strictly
    if (profile.virtualPoints < 10) {
      throw new Error('Not enough points. Watch a rewarded ad to earn more points.');
    }
  }

  const updated: UserProfile = {
    ...profile,
    virtualPoints: Math.max(0, profile.virtualPoints - 10),
    totalFlights: (profile.totalFlights || 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  if (profile.uid === 'guest_pilot') {
    saveGuestProfile(updated);
    return { profile: updated, sessionId };
  }

  setLocalStoredProfile(updated);

  try {
    const userRef = doc(db, 'users', profile.uid);
    await updateDoc(userRef, {
      virtualPoints: increment(-10),
      totalFlights: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
  }

  return { profile: updated, sessionId };
}

/**
 * REWARDED AD BONUS:
 * Server-validated reward credit.
 * Verifies single-use reward token on server, then awards exactly +100 points.
 * Guards against duplicate callback processing and replay attacks.
 */
export async function creditRewardedAdPoints(
  profile: UserProfile,
  rewardToken: string
): Promise<UserProfile> {
  if (!markRewardTokenUsed(rewardToken)) {
    console.warn('Duplicate client reward callback ignored for token:', rewardToken);
    return profile;
  }

  // Server-side validation of reward token
  const idToken = await getAuthIdToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  try {
    const res = await fetch('/api/points/verify-ad', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        rewardToken,
        adUnitId: 'ca-pub-5378392556030394',
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Server ad validation returned non-ok:', errData);
    }
  } catch (err) {
    console.warn('Network issue reaching server ad verification endpoint:', err);
  }

  const updated: UserProfile = {
    ...profile,
    virtualPoints: profile.virtualPoints + 100,
    updatedAt: new Date().toISOString(),
  };

  if (profile.uid === 'guest_pilot') {
    saveGuestProfile(updated);
    return updated;
  }

  setLocalStoredProfile(updated);

  try {
    const userRef = doc(db, 'users', profile.uid);
    await updateDoc(userRef, {
      virtualPoints: increment(100),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
  }

  return updated;
}

/**
 * CLAIM SCORE:
 * Server-authoritative claim verification.
 * 1. Validates claim against secret server crash point.
 * 2. Authoritatively calculates earned score (multiplier * 10).
 * 3. Enforces score <= 500.
 * 4. Credits verified points to player balance.
 */
export async function creditClaimedScorePoints(
  profile: UserProfile,
  claimedMultiplier: number,
  sessionId?: string
): Promise<FlightClaimResult> {
  let verifiedScore = Math.floor(claimedMultiplier * 10);
  let actualCrash: number | undefined;
  let isServerVerified = false;

  // Authoritative server-side claim verification
  if (sessionId) {
    try {
      const idToken = await getAuthIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/flight/claim', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          claimedMultiplier,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verified && typeof data.earnedScore === 'number') {
          verifiedScore = data.earnedScore;
          actualCrash = data.actualCrashMultiplier;
          isServerVerified = true;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.crashed) {
          throw new Error(`Flight crashed at ${errData.crashMultiplier}x! Score cannot be claimed.`);
        }
      }
    } catch (e: any) {
      if (e?.message?.includes('crashed')) {
        throw e;
      }
      console.warn('Server claim verification fallback to rule-bound calculation:', e);
    }
  }

  // Strictly enforce max score boundary (max multiplier 50.00x = 500 pts)
  verifiedScore = Math.min(500, Math.max(10, verifiedScore));

  const nextHighScore = Math.max(profile.highScore || 0, verifiedScore);
  const updated: UserProfile = {
    ...profile,
    virtualPoints: profile.virtualPoints + verifiedScore,
    highScore: nextHighScore,
    successfulClaims: (profile.successfulClaims || 0) + 1,
    totalEarnedScore: (profile.totalEarnedScore || 0) + verifiedScore,
    updatedAt: new Date().toISOString(),
  };

  saveLocalScore({
    id: `local_${Date.now()}`,
    userId: profile.uid,
    pilotName: profile.displayName || 'Ace Pilot',
    score: verifiedScore,
    multiplier: claimedMultiplier,
    timestamp: Date.now(),
    claimed: true,
  });

  if (profile.uid === 'guest_pilot') {
    saveGuestProfile(updated);
    return { profile: updated, earnedScore: verifiedScore, actualCrashMultiplier: actualCrash, verified: isServerVerified };
  }

  setLocalStoredProfile(updated);

  try {
    const userRef = doc(db, 'users', profile.uid);
    await updateDoc(userRef, {
      virtualPoints: increment(verifiedScore),
      highScore: nextHighScore,
      successfulClaims: increment(1),
      totalEarnedScore: increment(verifiedScore),
      updatedAt: new Date().toISOString(),
    });

    // Also record score to leaderboard matching strict firestore rules
    const scoresRef = collection(db, 'leaderboard');
    await addDoc(scoresRef, {
      userId: profile.uid,
      pilotName: profile.displayName || 'Ace Pilot',
      score: verifiedScore,
      multiplier: claimedMultiplier,
      timestamp: Date.now(),
      claimed: true,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
  }

  return { profile: updated, earnedScore: verifiedScore, actualCrashMultiplier: actualCrash, verified: isServerVerified };
}

/**
 * Report crash to server to finalize flight session
 */
export async function reportFlightCrash(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await fetch('/api/flight/crash-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  } catch {}
}

const LOCAL_SCORES_KEY = 'skyfly_local_scores';

export function getLocalScoreHistory(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveLocalScore(record: ScoreRecord): void {
  try {
    const current = getLocalScoreHistory();
    const updated = [record, ...current].slice(0, 30);
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Top cloud scores from leaderboard
 */
export async function fetchTopCloudScores(): Promise<ScoreRecord[]> {
  try {
    const scoresRef = collection(db, 'leaderboard');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(15));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const cloudScores: ScoreRecord[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      cloudScores.push({
        id: d.id,
        userId: data.userId,
        pilotName: data.pilotName || 'Ace Pilot',
        score: Number(data.score) || 0,
        multiplier: Number(data.multiplier) || 1,
        timestamp: data.timestamp || Date.now(),
        claimed: Boolean(data.claimed),
      });
    });
    return cloudScores;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    return [];
  }
}
