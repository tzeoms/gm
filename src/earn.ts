import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADS_V_yByD6H5KX-cFOJOlpcj6wgwK7es",
  authDomain: "gamermaid-f205d.firebaseapp.com",
  projectId: "gamermaid-f205d",
  // ... rest of your config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Listen to real-time USDT balance updates
function listenToDashboard(uid: string) {
  const userRef = doc(db, "users", uid);
  onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const usdt = data.usdtBalance || 0;
      const count = data.referralCount || 0;

      // Safely update the HTML elements
      const usdtDisplay = document.getElementById("usdt-display");
      const referralCounter = document.getElementById("referral-counter");

      if (usdtDisplay) usdtDisplay.innerText = `${usdt.toFixed(2)} USDT`;
      if (referralCounter) referralCounter.innerText = count.toString();
    }
  });
}

// 2. Track authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const refLinkInput = document.getElementById("referral-link") as HTMLInputElement;
    if (refLinkInput) {
      refLinkInput.value = `https://gamermaid.site/earn?ref=${user.uid}`;
    }
    listenToDashboard(user.uid);
  } else {
    // Redirect if they aren't signed in
    window.location.href = "/login.html";
  }
});
