// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDB7KFrxPgELz93fGZUezfVAfa_4JWcmYY",
  authDomain: "unlisted-axis.firebaseapp.com",
  projectId: "unlisted-axis",
  storageBucket: "unlisted-axis.firebasestorage.app",
  messagingSenderId: "769722212303",
  appId: "1:769722212303:web:6c665c5b68003f908afcba",
  measurementId: "G-5LQZ9W4KEQ",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
