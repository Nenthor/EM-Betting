import { dev } from '$app/environment';
import type { OrderByDirection, WhereFilterOp } from 'firebase/firestore/lite';
import { add, create, get, getAll, getQuery, remove, set } from './Firebase';

const collectionUser = dev ? 'dev-users' : 'users';
const collectionBet = dev ? 'dev-bets' : 'bets';

export interface User {
	username: string;
	password: string;
	bets: Bet[];
}

export interface Bet {
	id: string;
	createdBy: string;
	matchId: number;
	teamId: number;
}

// User functions
export async function getAllUsers(): Promise<User[]> {
	const data = await Promise.all([getAll(collectionUser) as Promise<User[]>, getAll(collectionBet) as Promise<Bet[]>]);
	const betsByUser = new Map<string, Bet[]>(); // k: username; v: Bet[]

	data[1].forEach((bet) => {
		if (!betsByUser.has(bet.createdBy)) {
			betsByUser.set(bet.createdBy, []);
		}
		betsByUser.get(bet.createdBy)!.push(bet);
	});

	data[0].forEach((user) => {
		user.bets = betsByUser.get(user.username) || [];
	});

	return data[0];
}

export async function getQueryUsers(field: keyof User, operator: WhereFilterOp, value: any, orderBy?: keyof User, direction: OrderByDirection = 'asc'): Promise<User[]> {
	const users = (await getQuery(collectionUser, field, operator, value, orderBy, direction)) as User[];

	return await Promise.all(
		users.map(async (user) => {
			user.bets = await getQueryBets('createdBy', '==', user.username);
			return user;
		})
	);
}

export async function getUser(username: string): Promise<User | undefined> {
	const data = await Promise.all([get(collectionUser, username.toLowerCase()) as Promise<User>, getQueryBets('createdBy', '==', username)]);
	if (!data[0]) return undefined;

	data[0].bets = data[1];
	return data[0];
}

/**
 * Updates or creates a user in the database
 * @param user User to be updated - bets will be ignored
 * @returns Promise<boolean> If the user was created successfully
 */
export async function setUser(user: User) {
	const dbUser: any = { ...user };
	delete dbUser.bets;

	return await set(collectionUser, dbUser.username.toLowerCase(), dbUser);
}

/**
 * Creates a new user in the database
 * @param user User to be created - bets will be ignored
 * @returns Promise<boolean> If the user was created successfully
 */
export async function createUser(user: User) {
	const dbUser: any = { ...user };
	delete dbUser.bets;
	return await create(collectionUser, dbUser.username.toLowerCase(), dbUser);
}

export async function removeUser(user: User) {
	const promises = user.bets.map((bet) => removeBet(bet.id));
	await Promise.all(promises);
	return await remove(collectionUser, user.username.toLowerCase());
}

// Bet functions
export async function getAllBets(): Promise<Bet[]> {
	return (await getAll(collectionBet)) as Bet[];
}

export async function getBetsByUser(username: string) {
	return await getQueryBets('createdBy', '==', username);
}

export async function getQueryBets(field: keyof Bet, operator: WhereFilterOp, value: any, orderBy?: keyof Bet, direction: OrderByDirection = 'asc'): Promise<Bet[]> {
	return (await getQuery(collectionBet, field, operator, value, orderBy, direction)) as Bet[];
}

export async function getBet(id: string): Promise<Bet | undefined> {
	return (await get(collectionBet, id)) as Bet | undefined;
}

export async function setBet(bet: Bet) {
	return await set(collectionBet, bet.id, bet);
}

export async function addBet(bet: Bet) {
	const betId = await add(collectionBet, bet);
	if (betId) {
		const dbBet: Bet = { ...bet };
		dbBet.id = betId;
		const success = await setBet(dbBet);
		if (success) return dbBet;
	}
	return undefined;
}

export async function removeBet(id: string) {
	return await remove(collectionBet, id);
}
