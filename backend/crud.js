import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * GENERIC CRUD OPERATIONS
 */

// Subscribe to a collection for real-time updates
export const subscribeToCollection = (collectionName, callback, onError) => {
  try {
    const q = collection(db, collectionName);
    return onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Sort by createdAt descending
        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}: `, error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}: `, error);
    onError?.(error);
    throw error;
  }
};

// Create
export const createDocument = async (collectionName, data) => {
  try {
    if (!db) {
      console.error("❌ ERROR: El objeto 'db' es null. Firebase no se inicializó correctamente.");
      throw new Error("No se pudo conectar con la base de datos. Verifica tu configuración de Firebase.");
    }
    
    console.log(`Attempting to write to collection: ${collectionName}...`);
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`❌ Error en createDocument (${collectionName}):`, error.code, error.message);
    if (error.message?.includes("404")) {
      throw new Error("Error 404: La base de datos de Firestore no existe o el ID del proyecto es incorrecto.");
    }
    throw error;
  }
};

// Read All
export const getDocuments = async (collectionName) => {
  try {
    if (!db) throw new Error("Firestore (db) no está inicializado. Revisa tus variables de entorno.");
    const q = collection(db, collectionName);
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar manualmente por createdAt si existe, para evitar problemas de índices en Firebase
    return data.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}: `, error);
    throw error;
  }
};

// Read One
export const getDocumentById = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}: `, error);
    throw error;
  }
};

// Update
export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}: `, error);
    throw error;
  }
};

// Delete
export const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}: `, error);
    throw error;
  }
};

/**
 * SPECIFIC COLLECTIONS MAPPING
 * Based on the page structure and types found
 */

// 1. BLOGS (Posts, News)
export const blogActions = {
  create: (data) => createDocument("blogs", data),
  getAll: () => getDocuments("blogs"),
  getById: (id) => getDocumentById("blogs", id),
  update: (id, data) => updateDocument("blogs", id, data),
  delete: (id) => deleteDocument("blogs", id)
};

// 2. FEATURES (Homepage features)
export const featureActions = {
  create: (data) => createDocument("features", data),
  getAll: () => getDocuments("features"),
  update: (id, data) => updateDocument("features", id, data),
  delete: (id) => deleteDocument("features", id)
};

// 3. TESTIMONIALS (Customer reviews)
export const testimonialActions = {
  create: (data) => createDocument("testimonials", data),
  getAll: () => getDocuments("testimonials"),
  update: (id, data) => updateDocument("testimonials", id, data),
  delete: (id) => deleteDocument("testimonials", id)
};

// 4. CONTACTS (Form submissions)
export const contactActions = {
  create: (data) => createDocument("contacts", data),
  getAll: () => getDocuments("contacts"),
  delete: (id) => deleteDocument("contacts", id)
};

// 5. BRANDS (Partner logos)
export const brandActions = {
  create: (data) => createDocument("brands", data),
  getAll: () => getDocuments("brands"),
  update: (id, data) => updateDocument("brands", id, data),
  delete: (id) => deleteDocument("brands", id)
};

// 6. PRICING (Subscription plans)
export const pricingActions = {
  create: (data) => createDocument("pricing", data),
  getAll: () => getDocuments("pricing"),
  update: (id, data) => updateDocument("pricing", id, data),
  delete: (id) => deleteDocument("pricing", id)
};

// 7. USERS (Profiles)
export const ADMIN_EMAILS = ["admin@trl-crl.com", "supervisor@trl-crl.com"];

export const userActions = {
  getByEmail: async (email) => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },
  create: async (uid, data) => {
    // Verificar si ya existe un usuario con este email
    if (data.email) {
      const existingUser = await userActions.getByEmail(data.email);
      if (existingUser && existingUser.id !== uid) {
        throw new Error("Ya existe un usuario registrado con este correo");
      }
    }

    // Si el email está en la lista de administradores, forzamos el rol de admin
    const userData = { ...data };
    if (data.email && ADMIN_EMAILS.includes(data.email)) {
      userData.role = "admin";
    } else if (!userData.role) {
      userData.role = "user"; // Rol por defecto
    }

    const docRef = doc(db, "users", uid);
    return setDoc(docRef, { 
      ...userData, 
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp() 
    }, { merge: true });
  },
  getById: (uid) => getDocumentById("users", uid),
  getAll: () => getDocuments("users"),
  subscribe: (callback, onError) => subscribeToCollection("users", callback, onError),
  updateRole: (uid, role) => {
    const docRef = doc(db, "users", uid);
    return updateDoc(docRef, { role, updatedAt: serverTimestamp() });
  },
  updateStatus: (uid, status) => {
    const docRef = doc(db, "users", uid);
    return updateDoc(docRef, { status, updatedAt: serverTimestamp() });
  },
  delete: (uid) => {
    const docRef = doc(db, "users", uid);
    return deleteDoc(docRef);
  }
};

// 8. POTENCIALES 4TA CONVOCATORIA (empresas / proyectos para diagnóstico)
const POTENCIALES_COLLECTION = "potenciales_4ta_convocatoria";

export const companyActions = {
  create: (data) => createDocument(POTENCIALES_COLLECTION, data),
  getAll: () => getDocuments(POTENCIALES_COLLECTION),
  getByUserId: async (userId) => {
    try {
      if (!userId) return [];
      const q = query(collection(db, POTENCIALES_COLLECTION), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error en companyActions.getByUserId:", error);
      throw error;
    }
  },
  /** Lista en tiempo real todos los documentos de la colección en Firestore */
  subscribe: (callback, onError) =>
    subscribeToCollection(POTENCIALES_COLLECTION, callback, onError),
  getById: (id) => getDocumentById(POTENCIALES_COLLECTION, id),
  update: (id, data) => updateDocument(POTENCIALES_COLLECTION, id, data),
  delete: (id) => deleteDocument(POTENCIALES_COLLECTION, id),
};

// 9. DIAGNOSTICS (TRL/CRL results)
export const diagnosticActions = {
  create: (data) => createDocument("diagnostics", data),
  getAll: () => getDocuments("diagnostics"),
  subscribe: (callback, onError) => subscribeToCollection("diagnostics", callback, onError),
  getByUserId: async (userId) => {
    try {
      if (!userId) {
        console.warn("getByUserId: No userId provided");
        return [];
      }
      console.log("Buscando diagnósticos para el usuario:", userId);
      const q = query(
        collection(db, "diagnostics"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Encontrados ${data.length} diagnósticos para ${userId}`);

      // Ordenar por timestamp (ISO string) o por el objeto createdAt de Firestore
      return data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.timestamp || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.timestamp || 0).getTime() / 1000;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error en getByUserId:", error);
      throw error;
    }
  },
  getById: (id) => getDocumentById("diagnostics", id),
  update: (id, data) => updateDocument("diagnostics", id, data),
  delete: (id) => deleteDocument("diagnostics", id)
};

// 9. MESSAGES (Chat messages)
export const messageActions = {
  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        ...data,
        createdAt: serverTimestamp(),
        read: false
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error("Error en create message:", error);
      throw error;
    }
  },
  getByConversation: async (conversationId) => {
    try {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error en getByConversation:", error);
      throw error;
    }
  },
  subscribeToConversation: (conversationId, callback) => {
    try {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId)
      );
      return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        // Ordenar en el cliente para evitar requerir índice compuesto
        messages.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.createdAt || 0;
          const timeB = b.createdAt?.seconds || b.createdAt || 0;
          return timeA - timeB;
        });
        callback(messages);
      }, (error) => {
        console.error("Error en subscribeToConversation:", error);
      });
    } catch (error) {
      console.error("Error en subscribeToConversation:", error);
      throw error;
    }
  },
  markAsRead: async (messageId) => {
    try {
      const docRef = doc(db, "messages", messageId);
      await updateDoc(docRef, { read: true, readAt: serverTimestamp() });
    } catch (error) {
      console.error("Error en markAsRead:", error);
      throw error;
    }
  }
};
