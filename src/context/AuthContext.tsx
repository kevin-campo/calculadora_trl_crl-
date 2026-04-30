"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout } from "../../backend/auth";
import { userActions } from "../../backend/crud";

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      if (currentUser) {
        // Obtener datos adicionales (como el rol) desde Firestore
        try {
          const profile = await userActions.getById(currentUser.uid);
          setUser({ ...currentUser, ...profile });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
