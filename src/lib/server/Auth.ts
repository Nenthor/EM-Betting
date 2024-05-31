import { JWT_SECRET } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { getUserFromCache, updateCacheUser } from './DataHub';
import { getUser, type User } from './Database';

const SECRET = generateJWTSecret(JWT_SECRET); // We only have one password so we can use it as a secret
const expiresIn = 60 * 60 * 24 * 30; // 30 days

export const cookieName = '__session'; // NEEEDS TO BE NAMED LIKE THIS BECAUSE FIREBASE ONLY ALLOWS THIS NAME

export async function getUserFromCookies(cookies: Cookies): Promise<User | undefined> {
	const token = cookies.get(cookieName);
	if (!token) return;

	try {
		const { sub } = jwt.verify(token, SECRET);
		if (typeof sub !== 'string') throw new Error('Invalid token');

		const username = sub.toString();
		let user = getUserFromCache(username);
		if (user) return user; // cached user

		user = await getUser(username);
		if (user) {
			updateCacheUser(user);
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

export function logoutUser(cookies: Cookies) {
	cookies.delete(cookieName, { path: '/' });
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
