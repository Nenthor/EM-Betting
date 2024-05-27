import { JWT_SECRET } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { getUser, type User } from './Database';

const SECRET = generateJWTSecret(JWT_SECRET); // We only have one password so we can use it as a secret
const expiresIn = 60 * 60 * 24 * 7; // 7 days
const userCache = new Map<string, User>();
const MAX_CACHE_SIZE = 50;

export const cookieName = '__session'; // NEEEDS TO BE NAMED LIKE THIS BECAUSE FIREBASE ONLY ALLOWS THIS NAME

export async function getUserFromCookies(cookies: Cookies): Promise<User | undefined> {
	const token = cookies.get(cookieName);
	if (!token) return;

	try {
		const { sub } = jwt.verify(token, SECRET);
		if (typeof sub !== 'string') throw new Error('Invalid token');

		const username = sub.toString();
		if (userCache.has(username)) return userCache.get(username); // cached user
		const user = await getUser(username);
		if (user) {
			userCache.set(username, user);
			if (userCache.size > MAX_CACHE_SIZE) {
				userCache.delete(userCache.keys().next().value);
			}
			return user;
		}
	} catch (e) {
		console.log(e);
		cookies.delete(cookieName, { path: '/' });
	}
}

export function loginUser(user: User, password: string, cookies: Cookies) {
	if (user && checkPassword(password, user.password)) {
		const token = jwt.sign({ sub: user.username }, SECRET, { expiresIn });
		cookies.set(cookieName, token, { path: '/', sameSite: 'strict', secure: true, httpOnly: true, maxAge: expiresIn });
		return true;
	}
	return false;
}

export function logoutUser(user: User, cookies: Cookies) {
	cookies.delete(cookieName, { path: '/' });
	userCache.delete(user.username);
}

function generateJWTSecret(secret: string) {
	return createHash('sha256').update(secret).digest('hex');
}

function checkPassword(password: string, hash: string) {
	const [salt, key] = hash.split(':');
	const hashBuffer = scryptSync(password, salt, 64);
	const keyBuffer = Buffer.from(key, 'hex');
	return timingSafeEqual(hashBuffer, keyBuffer);
}

export function generateHash(input: string) {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(input, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}

export function checkDataIntegrity(username: string, password: string) {
	const regExp = /^[\w#*]+$/; // Only letters, numbers and underscores
	return regExp.test(username) && regExp.test(password);
}

export function getClientUser(user: User): User {
	const clientUser = { ...user };
	clientUser.password = '';
	return clientUser;
}
