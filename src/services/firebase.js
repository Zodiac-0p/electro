// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD66Ea2xmNpSZHGdbt6hHAvnOWeoMXiInI",
  authDomain: "electromodule-af8b1.firebaseapp.com",
  projectId: "electromodule-af8b1",
  storageBucket: "electromodule-af8b1.firebasestorage.app",
  messagingSenderId: "1042900774877",
  appId: "1:1042900774877:web:a97f259e80ab7c0cbfd034",
  measurementId: "G-7JCCR8PRNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);