import { getApp, getApps, initializeApp } from "firebase/app";
import { GithubAuthProvider, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZSmVr1o81J0ucnaD8jjPaXBazlhQznxk",
  authDomain: "itcommunitybd.firebaseapp.com",
  projectId: "itcommunitybd",
  storageBucket: "itcommunitybd.firebasestorage.app",
  messagingSenderId: "581103635663",
  appId: "1:581103635663:web:1d7b7d742a2e5ed17afbba",
  measurementId: "G-2R1CGQKF86"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope("user:email");

export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGithubPopup = () => signInWithPopup(auth, githubProvider);

export default app;
