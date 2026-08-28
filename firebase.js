import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "gamer-maid.firebaseapp.com",
    projectId: "gamer-maid",
    storageBucket: "gamer-maid.firebasestorage.app",
    messagingSenderId: "221352502412",
    appId: "1:221352502412:web:af39371a216f56557f87a9",
    measurementId: "G-XD1F6N2PVH"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export {
    auth,
    provider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
};
