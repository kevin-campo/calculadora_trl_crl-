"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthChanges, logout } from "../../backend/auth";
import { userActions, ADMIN_EMAILS } from "../../backend/crud";

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
      setLoading(true);
      if (currentUser) {
        // Obtener datos adicionales (como el rol) desde Firestore
        try {
          const profile = await userActions.getById(currentUser.uid);
          // Spread currentUser (Firebase User) carefully or merge with profile
          let finalUser = { ...currentUser, ...profile };

          // Verificación de seguridad: si el email está en la lista de admins
          // pero el perfil no tiene el rol, lo forzamos y actualizamos Firestore
          if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
            if (finalUser.role !== "admin") {
              console.log("Forzando rol de administrador para:", currentUser.email);
              finalUser.role = "admin";
              // Actualizar para que persista el rol de admin
              userActions.create(currentUser.uid, {
                name: currentUser.displayName || profile?.name || "Admin",
                email: currentUser.email, 
                role: "admin"
              });
            }
          }

          setUser(finalUser);
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
