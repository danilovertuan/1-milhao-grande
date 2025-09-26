import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD92OfyBzYu-2KboRR9Jw4X8rFzniJEFzk",
  authDomain: "milho-grande-e189a.firebaseapp.com",
  projectId: "milho-grande-e189a",
  storageBucket: "milho-grande-e189a.firebasestorage.app",
  messagingSenderId: "825882602807",
  appId: "1:825882602807:web:c8f2578567e74a1881beb2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
