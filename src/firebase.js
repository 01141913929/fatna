// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from 'firebase/messaging';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_DgRq79YOK5QI4Q5Zw38mQVkS7X19qAk",
  authDomain: "fatna-site.firebaseapp.com",
  projectId: "fatna-site",
  storageBucket: "fatna-site.firebasestorage.app",
  messagingSenderId: "997074658437",
  appId: "1:997074658437:web:337f45aa5ffd77811735ec",
  measurementId: "G-7WDGE1M5JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

const messaging = getMessaging(app);
// Export everything
export { db, analytics, messaging };
export default app;