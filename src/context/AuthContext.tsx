"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout } from "../../backend/auth";
import { userActions, ADMIN_EMAILS } from "../../backend/crud";

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => { },
  refreshUser: async () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (currentUser) => {
    if (!currentUser) return null;
    try {
      const profile = await userActions.getById(currentUser.uid);
      
      let finalUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || profile?.name,
        photoURL: currentUser.photoURL || profile?.photoURL,
        ...profile,
      };

      if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
        if (finalUser.role !== "admin") {
          finalUser.role = "admin";
          userActions.create(currentUser.uid, {
            name: currentUser.displayName || profile?.name || "Admin",
            email: currentUser.email, 
            role: "admin"
          });
        }
      }
      return finalUser;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return currentUser;
    }
  };

  const refreshUser = async () => {
    const { auth } = await import("../../backend/firebase");
    const currentUser = auth.currentUser;
    if (currentUser) {
      const updatedUser = await fetchUserProfile(currentUser);
      setUser(updatedUser);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const finalUser = await fetchUserProfile(currentUser);
        setUser(finalUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
