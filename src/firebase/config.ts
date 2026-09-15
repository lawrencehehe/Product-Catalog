import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0rfuJ9ueWVKmlfku0DkFuuJMcCkYw4sA",
  authDomain: "product-catalog-9b60d.firebaseapp.com",
  projectId: "product-catalog-9b60d",
  storageBucket: "product-catalog-9b60d.firebasestorage.app",
  messagingSenderId: "1010502478053",
  appId: "1:1010502478053:web:128bbbaa60830a7f6d0c0c",
  measurementId: "G-YRHZG2E8H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);