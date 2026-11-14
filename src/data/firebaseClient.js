import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, serverTimestamp } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);
const app = firebaseConfigured ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

function requireFirebase() {
  if (!auth || !db) throw new Error("Google sign-in is not configured yet. Add the Firebase web settings and redeploy.");
}

export function watchAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  if (!result.user.emailVerified) {
    await signOut(auth);
    throw new Error("Use a Google account with a verified email address.");
  }
  return result.user;
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}

export async function loadUserProfile(uid) {
  requireFirebase();
  const snapshot = await getDoc(doc(db, "users", uid, "private", "profile"));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveUserProfile(uid, profile) {
  requireFirebase();
  const safeProfile = {
    name: String(profile.name ?? "").slice(0, 80),
    classLevel: profile.classLevel == null ? null : Number(profile.classLevel),
    studyTrack: profile.studyTrack ?? "ncert",
    createdAt: profile.createdAt ?? new Date().toISOString(),
    reactionHistory: Array.isArray(profile.reactionHistory) ? profile.reactionHistory.slice(0, 100) : [],
    quizHistory: Array.isArray(profile.quizHistory) ? profile.quizHistory.slice(0, 100) : [],
    inventory: Array.isArray(profile.inventory) ? profile.inventory : [],
    benchSelection: Array.isArray(profile.benchSelection) ? profile.benchSelection : [],
    activeChemicalId: profile.activeChemicalId ?? null,
    sampleMass: Number(profile.sampleMass) || 5,
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", uid, "private", "profile"), safeProfile, { merge: true });
  return safeProfile;
}
