// firebase-config.js - Email/Password & Anonymous Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInAnonymously,
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBRrvbIb2oJmRR2VvPapc04CoPb2la2DNA",
    authDomain: "middleman-3b4d7.firebaseapp.com",
    databaseURL: "https://middleman-3b4d7-default-rtdb.firebaseio.com",
    projectId: "middleman-3b4d7",
    storageBucket: "middleman-3b4d7.firebasestorage.app",
    messagingSenderId: "958222361835",
    appId: "1:958222361835:web:9243b6991c98744884caae",
    measurementId: "G-HTGZD0DMN9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function registerEmail(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginEmail(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function loginAnonymous() {
    return await signInAnonymously(auth);
}

export async function logoutUser() {
    return await signOut(auth);
}

export function trackAuth(callback) {
    onAuthStateChanged(auth, callback);
}

export async function saveEscrowSubmission(data) {
    return await addDoc(collection(db, "escrow_submissions"), {
        ...data,
        createdAt: serverTimestamp()
    });
}

export async function saveChatMessage(message) {
    return await addDoc(collection(db, "live_chats"), {
        ...message,
        createdAt: serverTimestamp()
    });
}
