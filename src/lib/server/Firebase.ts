import { SERVER_FIREBASE_CONFIG } from '$env/static/private';
import firebase from 'firebase-admin';
import type { DocumentData, OrderByDirection, WhereFilterOp, WithFieldValue } from 'firebase/firestore/lite';

const app = firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(SERVER_FIREBASE_CONFIG))
});
const db = app.firestore();

export type Reference = firebase.firestore.DocumentReference<DocumentData>;

export function getReference(collection: string, id: string): Reference {
	return db.collection(collection).doc(id);
}

export async function getAll(collection: string) {
	try {
		const data = await db.collection(collection).get();
		return data.docs.map((doc) => doc.data());
	} catch (error) {
		return [];
	}
}

export async function getQuery(collection: string, field: string, operator: WhereFilterOp, value: any, orderBy?: string, direction: OrderByDirection = 'asc') {
	try {
		let query = db.collection(collection).where(field, operator, value);
		if (orderBy) {
			query = query.orderBy(orderBy, direction);
		}
		const data = await query.get();
		return data.docs.map((doc) => doc.data());
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function get(collection: string, id: string) {
	try {
		const data = await db.collection(collection).doc(id).get();
		return data.data();
	} catch (error) {
		return undefined;
	}
}

export async function set(collection: string, id: string, data: WithFieldValue<DocumentData>) {
	try {
		await db.collection(collection).doc(id).set(data);
		return true;
	} catch (error) {
		return false;
	}
}

export async function create(collection: string, id: string, data: WithFieldValue<DocumentData>) {
	try {
		await db.collection(collection).doc(id).create(data);
		return true;
	} catch (error) {
		return false;
	}
}

export async function add(collection: string, data: WithFieldValue<DocumentData>) {
	try {
		const doc = await db.collection(collection).add(data);
		return doc.id;
	} catch (error) {
		return undefined;
	}
}

export async function remove(collection: string, id: string) {
	try {
		await db.collection(collection).doc(id).delete();
		return true;
	} catch (error) {
		return false;
	}
}
