import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  setDoc,
  Query,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';


// Tipos
export interface UserProfile {
  id: string;
  userId: string;
  nombre: string;
  email: string;
  telefono?: string;
  role: string;
  createdAt?: any;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  marca?: string;
  modelo?: string;
  disponibilidad?: string;
  ubicaciones: string[];
  tipoNegocio?: 'renta' | 'venta' | 'ambos';
  createdAt?: any;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenDestacada?: string;
  destacada?: boolean;
  ubicaciones: string[];
  createdAt?: any;
}

export interface SucursalData {
  nombre: string;
  telefono: string;
  whatsapp: string;
  email: string;
  facebook: string;
  direccion: string;
  mapQuery: string;
}

export const DEFAULT_SUCURSALES: Record<string, SucursalData> = {
  cdmx: {
    nombre: 'Ciudad de México',
    telefono: '+52 55 1234 5678',
    whatsapp: '525512345678',
    email: 'cdmx@machina.mx',
    facebook: 'https://m.me/MachinaOficial',
    direccion: 'Tracsa Caterpillar Ciudad de México',
    mapQuery: 'Tracsa Caterpillar Ciudad de Mexico',
  },
  monterrey: {
    nombre: 'Monterrey',
    telefono: '+52 81 1234 5678',
    whatsapp: '528112345678',
    email: 'mty@machina.mx',
    facebook: 'https://m.me/MachinaOficial',
    direccion: 'Madisa Caterpillar Monterrey',
    mapQuery: 'Madisa Caterpillar Monterrey',
  },
  guadalajara: {
    nombre: 'Guadalajara',
    telefono: '+52 33 1234 5678',
    whatsapp: '523312345678',
    email: 'gdl@machina.mx',
    facebook: 'https://m.me/MachinaOficial',
    direccion: 'Tracsa Caterpillar Guadalajara',
    mapQuery: 'Tracsa Caterpillar Guadalajara',
  },
  queretaro: {
    nombre: 'Querétaro',
    telefono: '+52 44 1234 5678',
    whatsapp: '524412345678',
    email: 'qro@machina.mx',
    facebook: 'https://m.me/MachinaOficial',
    direccion: 'Tracsa Caterpillar Querétaro',
    mapQuery: 'Tracsa Caterpillar Queretaro',
  },
};

export function getSucursalDefaults(): Record<string, SucursalData> {
  return DEFAULT_SUCURSALES;
}

// Colecciones
export const COLLECTIONS = {
  PRODUCTS: 'productos',
  CATEGORIES: 'categorias',
  CONTACT_MESSAGES: 'mensajes_contacto',
  FAVORITES: 'favoritos',
  USERS: 'usuarios',
  CONFIG: 'config',
};

// Productos
export async function getProducts(category?: string) {
  let q: Query<DocumentData> = collection(db, COLLECTIONS.PRODUCTS);
  
  if (category && category !== 'Todas') {
    q = query(q, where('categoria', '==', category));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductById(id: string) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// Mensajes de contacto
export async function sendContactMessage(data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  sucursal?: string;
  canal?: string;
  tipoServicio?: string;
}) {
  const docRef = await addDoc(collection(db, COLLECTIONS.CONTACT_MESSAGES), {
    ...data,
    fecha: serverTimestamp(),
    leido: false,
  });
  return docRef.id;
}

// Favoritos
export async function addFavorite(userId: string, productId: string) {
  const docRef = await addDoc(collection(db, COLLECTIONS.FAVORITES), {
    usuarioId: userId,
    productoId: productId,
    fecha: serverTimestamp(),
  });
  return docRef.id;
}

export async function getFavorites(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.FAVORITES),
    where('usuarioId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().productId);
}

// Mensajes de contacto - Admin
export async function getContactMessages() {
  const q = query(
    collection(db, COLLECTIONS.CONTACT_MESSAGES),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function markMessageAsRead(messageId: string) {
  const docRef = doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId);
  await updateDoc(docRef, { leido: true });
}

export async function deleteContactMessage(messageId: string) {
  const docRef = doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId);
  await deleteDoc(docRef);
}

// CRUD Productos - Admin
export async function createProduct(data: {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  marca?: string;
  modelo?: string;
  disponibilidad?: string;
  ubicaciones?: string[];
  tipoNegocio?: 'renta' | 'venta' | 'ambos';
}) {
  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    ...data,
    createdAt: serverTimestamp(),
    disponibilidad: data.disponibilidad || 'disponible',
    ubicaciones: data.ubicaciones && data.ubicaciones.length > 0 ? data.ubicaciones : ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'],
    tipoNegocio: data.tipoNegocio || 'renta',
  });
  return docRef.id;
}

export async function updateProduct(id: string, data: {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  imagen?: string;
  marca?: string;
  modelo?: string;
  disponibilidad?: string;
  ubicaciones?: string[];
  tipoNegocio?: 'renta' | 'venta' | 'ambos';
}) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
}



// Usuarios
export async function createUserProfile(userId: string, data: {
  nombre: string;
  email: string;
  telefono?: string;
  role?: string;
}) {
  // Usar setDoc para que si ya existe el documento, lo sobrescriba en lugar de crear otro
  await setDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...data,
    userId,
    role: data.role || 'usuario',
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const usersRef = collection(db, COLLECTIONS.USERS) as CollectionReference<DocumentData>;
  const q = query(usersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserProfile;
}

export async function updateUserProfile(userId: string, data: { nombre?: string; telefono?: string }) {
  const usersRef = collection(db, COLLECTIONS.USERS) as CollectionReference<DocumentData>;
  const q = query(usersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const userDoc = snapshot.docs[0];
  await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), data);
}

export async function updateUserRole(userId: string, role: string) {
  const usersRef = collection(db, COLLECTIONS.USERS) as CollectionReference<DocumentData>;
  const q = query(usersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const userDoc = snapshot.docs[0];
  await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), { role });
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteUser(userId: string) {
  const usersRef = collection(db, COLLECTIONS.USERS) as CollectionReference<DocumentData>;
  const q = query(usersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const userDoc = snapshot.docs[0];
  await deleteDoc(doc(db, COLLECTIONS.USERS, userDoc.id));
}

// Configuración del sitio
export async function getConfig() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.CONFIG));
  if (snapshot.empty) return null;
  // Si hay varios (por error), devolvemos el primero pero el update los limpiará
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function updateConfig(data: {
  nombreEmpresa?: string;
  instagram?: string;
  horario?: string;
  sucursales?: Record<string, SucursalData>;
}) {
  const snapshot = await getDocs(collection(db, COLLECTIONS.CONFIG));
  
  if (snapshot.empty) {
    await addDoc(collection(db, COLLECTIONS.CONFIG), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Actualizar el primero y borrar los demás para mantener una sola fuente de verdad
    const [first, ...others] = snapshot.docs;
    await updateDoc(doc(db, COLLECTIONS.CONFIG, first.id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Limpieza de duplicados si los hay
    for (const extraDoc of others) {
      await deleteDoc(doc(db, COLLECTIONS.CONFIG, extraDoc.id));
    }
  }
}

// Categorías
export async function getCategories() {
  const categoriesRef = collection(db, COLLECTIONS.CATEGORIES) as CollectionReference<DocumentData>;
  const q = query(categoriesRef, orderBy('nombre', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCategoryById(id: string) {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createCategory(data: {
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenDestacada?: string;
  destacada?: boolean;
  ubicaciones?: string[];
}) {
  const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    ...data,
    ubicaciones: data.ubicaciones && data.ubicaciones.length > 0 ? data.ubicaciones : ['CDMX', 'Monterrey', 'Guadalajara', 'Querétaro'],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(id: string, data: {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  imagenDestacada?: string;
  destacada?: boolean;
  ubicaciones?: string[];
}) {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string) {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await deleteDoc(docRef);
}