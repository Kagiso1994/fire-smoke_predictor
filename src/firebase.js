// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcMHfdokDBetSFKo0-g3e_qpXf9htmCJ8",
  authDomain: "react-and-firebase-b3e4b.firebaseapp.com",
  databaseURL: "https://react-and-firebase-b3e4b.firebaseio.com",
  projectId: "react-and-firebase-b3e4b",
  storageBucket: "react-and-firebase-b3e4b.appspot.com",
  messagingSenderId: "950056501127",
  appId: "1:950056501127:web:95e79bf80950c4b2a99d22",
  measurementId: "G-6J08ZR4467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)
const storage = getStorage(app)

export {storage, db, analytics}
