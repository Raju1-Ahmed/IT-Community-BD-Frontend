import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { auth, signInWithGithubPopup, signInWithGooglePopup } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (_error) {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMe();
      setLoading(false);
    };
    init();
    return onAuthStateChanged(auth, setFirebaseUser);
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    void signOut(auth);
  };

  const socialSignIn = async (provider, role = "seeker") => {
    const result = await (provider === "github" ? signInWithGithubPopup() : signInWithGooglePopup());
    setFirebaseUser(result.user);
    const idToken = await result.user.getIdToken(true);
    const { data } = await api.post("/auth/firebase", { idToken, role });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const value = useMemo(
    () => ({ user, firebaseUser, loading, login, register, socialSignIn, logout, refreshUser: fetchMe }),
    [user, firebaseUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
