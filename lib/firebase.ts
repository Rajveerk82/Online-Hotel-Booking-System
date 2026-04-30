import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASwMik6q67pgOdAKoCfAeLW4x5iUlk4GI",
  authDomain: "hotelhub-c17fb.firebaseapp.com",
  projectId: "hotelhub-c17fb",
  storageBucket: "hotelhub-c17fb.firebasestorage.app",
  messagingSenderId: "726322134363",
  appId: "1:726322134363:web:a1eadaa716c1cde7082e7e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db =
  typeof window === 'undefined'
    ? getFirestore(app)
    : initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
export const storage = getStorage(app);

export default app;
