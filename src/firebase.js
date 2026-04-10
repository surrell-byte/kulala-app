import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC09m_I_y6JRcPmVrcx0e3o2ZvxaxQv4LY",
  authDomain: "kulala-app.firebaseapp.com",
  projectId: "kulala-app",
  storageBucket: "kulala-app.appspot.com",
  messagingSenderId: "276208934715",
  appId: "1:276208934715:web:534d4a452c5a135285611e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);