import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";
import { userActions } from "./crud";

// Proveedores
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * AUTH ACTIONS
 */

// Registrar con Email
export const signUpWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await userActions.create(user.uid, {
      name: name,
      email: email,
      photoURL: user.photoURL || "",
      provider: "password"
    });

    return user;
  } catch (error) {
    console.error("Error en Registro:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Este correo ya está registrado. Intenta iniciar sesión.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("La contraseña es muy débil. Usa al menos 6 caracteres.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("El formato del correo no es válido.");
    }
    throw error;
  }
};

// Iniciar Sesión con Email
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error en Inicio de Sesión:", error.code, error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Correo o contraseña incorrectos. Si no tienes cuenta, regístrate primero.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Demasiados intentos fallidos. Por favor, intenta más tarde.");
    }
    throw error;
  }
};

// Suscribirse a cambios de autenticación
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Inicio de Sesión / Registro con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await userActions.create(user.uid, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      provider: "google"
    });

    return user;
  } catch (error) {
    console.error("Error en Google Auth:", error.code, error.message);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("La ventana de inicio de sesión se cerró antes de completar el proceso.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Se canceló la solicitud de inicio de sesión.");
    }
    throw error;
  }
};

// Inicio de Sesión / Registro con Github
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    await userActions.create(user.uid, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      provider: "github"
    });

    return user;
  } catch (error) {
    console.error("Error en Github Auth:", error);
    throw error;
  }
};

// Cerrar Sesión
export const logout = () => signOut(auth);

// Actualizar información del perfil
export const updateUserProfileInfo = async (name, photoURL) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay un usuario autenticado");

  try {
    const updates = {};
    if (name) updates.displayName = name;
    if (photoURL) updates.photoURL = photoURL;

    // 1. Actualizar en Firebase Auth
    await updateProfile(user, updates);

    // 2. Actualizar en Firestore
    const firestoreUpdates = {};
    if (name) firestoreUpdates.name = name;
    if (photoURL) firestoreUpdates.photoURL = photoURL;

    await userActions.create(user.uid, firestoreUpdates);

    return user;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
};
