import type { OrderByDirection, WhereFilterOp } from 'firebase/firestore/lite';
import { add, create, get, getAll, getQuery, remove, set } from './Firebase';

export interface User {
	username: string;
	password: string;
	photoURL: string;
	bets: Bet[];
}

export interface Bet {
	id: string;
	createdBy: string;
	bet_amount: number;
	multiplier: number;
	matchId: number;
}

// User functions
export async function getAllUsers(): Promise<User[]> {
	const data = await Promise.all([getAll('users') as Promise<User[]>, getAll('bets') as Promise<Bet[]>]);
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
	const users = (await getQuery('users', field, operator, value, orderBy, direction)) as User[];

	return await Promise.all(
		users.map(async (user) => {
			user.bets = await getQueryBets('createdBy', '==', user.username);
			return user;
		})
	);
}

export async function getUser(username: string): Promise<User | undefined> {
	const data = await Promise.all([get('users', username) as Promise<User>, getQueryBets('createdBy', '==', username)]);
	if (!data[0]) return undefined;

	data[0].bets = data[1];
	return data[0];
}

export async function setUser(user: User) {
	const dbUser: any = { ...user };
	delete dbUser.bets;

	return await set('users', dbUser.username, dbUser);
}

export async function createUser(user: User) {
	const dbUser: any = { ...user };
	delete dbUser.bets;
	return await create('users', dbUser.username, dbUser);
}

export async function removeUser(username: string) {
	return await remove('users', username);
}

// Bet functions
export async function getAllBets(): Promise<Bet[]> {
	return (await getAll('bets')) as Bet[];
}

export async function getBetsByUser(username: string) {
	return await getQueryBets('createdBy', '==', username);
}

export async function getQueryBets(field: keyof Bet, operator: WhereFilterOp, value: any, orderBy?: keyof Bet, direction: OrderByDirection = 'asc'): Promise<Bet[]> {
	return (await getQuery('bets', field, operator, value, orderBy, direction)) as Bet[];
}

export async function getBet(id: string): Promise<Bet | undefined> {
	return (await get('bets', id)) as Bet | undefined;
}

export async function setBet(bet: Bet) {
	return await set('bets', bet.id, bet);
}

export async function addBet(bet: Bet) {
	const betId = await add('bets', bet);
	if (betId) {
		const dbBet: Bet = { ...bet };
		dbBet.id = betId;
		return await setBet(dbBet);
	}
	return undefined;
}

export async function removeBet(id: string) {
	return await remove('bets', id);
}
