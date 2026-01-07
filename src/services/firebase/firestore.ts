// Firestore Database Service
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Get a document from Firestore
 */
export const getDocument = async <T>(
    collectionName: string,
    documentId: string
): Promise<T | null> => {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Get all documents from a collection for a specific user
 */
export const getUserDocuments = async <T>(
    userId: string,
    collectionName: string
): Promise<T[]> => {
    try {
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const querySnapshot = await getDocs(collectionRef);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];
    } catch (error) {
        console.error(`Error getting documents from ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Set (create or update) a document in Firestore
 */
export const setDocument = async <T extends Record<string, any>>(
    userId: string,
    collectionName: string,
    documentId: string,
    data: T
): Promise<void> => {
    try {
        const docRef = doc(db, `users/${userId}/${collectionName}`, documentId);
        await setDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
            syncedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error(`Error setting document in ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Update a document in Firestore
 */
export const updateDocument = async <T extends Record<string, any>>(
    userId: string,
    collectionName: string,
    documentId: string,
    data: Partial<T>
): Promise<void> => {
    try {
        const docRef = doc(db, `users/${userId}/${collectionName}`, documentId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
            syncedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error(`Error updating document in ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Delete a document from Firestore
 */
export const deleteDocument = async (
    userId: string,
    collectionName: string,
    documentId: string
): Promise<void> => {
    try {
        const docRef = doc(db, `users/${userId}/${collectionName}`, documentId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting document from ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Batch set multiple documents
 */
export const batchSetDocuments = async <T extends Record<string, any>>(
    userId: string,
    collectionName: string,
    documents: Array<{ id: string; data: T }>
): Promise<void> => {
    try {
        const promises = documents.map(({ id, data }) =>
            setDocument(userId, collectionName, id, data)
        );
        await Promise.all(promises);
    } catch (error) {
        console.error(`Error batch setting documents in ${collectionName}:`, error);
        throw error;
    }
};
