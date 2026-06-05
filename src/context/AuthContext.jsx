import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub = null;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }
      if (u) {
        // Real-time listener — profile updates instantly
        profileUnsub = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) setProfile({ ...snap.data(), uid: u.uid });
          else setProfile({});
          setLoading(false);
        }, () => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => { unsub(); if (profileUnsub) profileUnsub(); };
  }, []);

  // ── Presence tracking — update lastSeen every minute while user is online
  useEffect(() => {
    if (!user) return;
    const updatePresence = async () => {
      try {
        await setDoc(doc(db, 'presence', user.uid), {
          uid: user.uid,
          lastSeen: serverTimestamp(),
        }, { merge: true });
      } catch(e) { /* silent */ }
    };
    updatePresence(); // Update immediately
    const id = setInterval(updatePresence, 60_000); // every 60 sec
    // Also update on visibility change
    const onVis = () => { if (!document.hidden) updatePresence(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [user]);

  const refreshProfile = async () => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setProfile(snap.data());
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
