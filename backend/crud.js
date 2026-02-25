import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * GENERIC CRUD OPERATIONS
 */

// Create
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}: `, error);
    throw error;
  }
};

// Read All
export const getDocuments = async (collectionName, orderByField = "createdAt") => {
  try {
    const q = query(collection(db, collectionName), orderBy(orderByField, "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  getAll: () => getDocuments("blogs", "publishDate"),
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
export const userActions = {
  create: (uid, data) => {
    // En usuarios solemos usar el UID de Auth como ID del documento
    const docRef = doc(db, "users", uid);
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },
  getById: (uid) => getDocumentById("users", uid)
};

// 8. DIAGNOSTICS (TRL/CRL results)
export const diagnosticActions = {
  create: (data) => createDocument("diagnostics", data),
  getAll: () => getDocuments("diagnostics"),
  getByUserId: async (userId) => {
    try {
      const q = query(
        collection(db, "diagnostics"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user diagnostics: ", error);
      throw error;
    }
  },
  getById: (id) => getDocumentById("diagnostics", id),
  delete: (id) => deleteDocument("diagnostics", id)
};
