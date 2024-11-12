import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkh2cHZtrj32OR2POAO49gr3yN8S-6W7c",
  authDomain: "aih-doctranslate.firebaseapp.com",
  projectId: "aih-doctranslate",
  storageBucket: "aih-doctranslate.firebasestorage.app",
  messagingSenderId: "117099427249",
  appId: "1:117099427249:web:51af6a768e4937319b3990",
  measurementId: "G-CPGLM61CH9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable persistence
auth.setPersistence('local');