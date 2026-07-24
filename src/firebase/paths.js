import { collection, doc } from 'firebase/firestore';
import { db } from './config';

// Centralized Firestore path builders.
// Structure:
// users/{uid}/vehicles/{vehicleId}/{subcollection}/{docId}

export const userDoc = (uid) => doc(db, 'users', uid);

export const vehiclesCol = (uid) => collection(db, 'users', uid, 'vehicles');

export const vehicleDoc = (uid, vehicleId) =>
  doc(db, 'users', uid, 'vehicles', vehicleId);

export const subCol = (uid, vehicleId, subcollection) =>
  collection(db, 'users', uid, 'vehicles', vehicleId, subcollection);

export const subDoc = (uid, vehicleId, subcollection, docId) =>
  doc(db, 'users', uid, 'vehicles', vehicleId, subcollection, docId);

// Convenience shortcuts used throughout the app
export const SUBCOLLECTIONS = {
  FUEL: 'fuelLogs',
  SERVICE: 'serviceLogs',
  EXPENSE: 'expenseLogs',
  PARTS: 'partLogs',
  DOCUMENTS: 'documents',
  PHOTOS: 'photos',
  REMINDERS: 'reminders',
  TIMELINE: 'timeline',
  NOTES: 'notes',
  TYRES: 'tyres',
};
