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

    // Actualizar nombre en el perfil de Auth
    await updateProfile(user, { displayName: name });

    // Crear documento del usuario en Firestore
    await userActions.create(user.uid, {
      name: name,
      email: email,
      photoURL: user.photoURL || "",
      provider: "password"
    });

    return user;
  } catch (error) {
    console.error("Error en Registro:", error);
    throw error;
  }
};

// Iniciar Sesión con Email
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error en Inicio de Sesión:", error);
    throw error;
  }
};

// Inicio de Sesión / Registro con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore o simplemente actualizarlo
    // userActions.create usa updateDoc con merge (o similar) para no sobreescribir datos antiguos si no es necesario
    await userActions.create(user.uid, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      provider: "google"
    });

    return user;
  } catch (error) {
    console.error("Error en Google Auth:", error);
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

// Observador de estado de autenticación (hook-like helper)
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Actualizar información del perfil
export const updateUserProfileInfo = async (name) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay un usuario autenticado");

  try {
    // 1. Actualizar en Firebase Auth
    await updateProfile(user, { displayName: name });

    // 2. Actualizar en Firestore
    await userActions.create(user.uid, {
      name: name,
    });

    return user;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
};
