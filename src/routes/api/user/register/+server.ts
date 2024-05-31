import { getResponse } from '$lib/General';
import { checkDataIntegrity, generateHash, loginUser } from '$lib/server/Auth';
import { updateCacheUser } from '$lib/server/DataHub';
import { createUser, getUser, type User } from '$lib/server/Database';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, cookies }) => {
	const username = request.headers.get('username')?.toString().trim();
	const password = request.headers.get('password')?.toString().trim();

	if (!username || !password) {
		return getResponse('error', 'Benutzername oder Passwort fehlen.');
	}
	if (!checkDataIntegrity(username, password)) {
		return getResponse('error', 'Nur Buchstaben, Zahlen und _#* sind erlaubt.');
	}
	if (username.length < 3) {
		return getResponse('error', 'Benutzername muss mindestens 3 Zeichen lang sein.');
	}
	if (username.length > 15) {
		return getResponse('error', 'Benutzername darf maximal 15 Zeichen lang sein.');
	}
	if (password.length < 3) {
		return getResponse('error', 'Passwort muss mindestens 3 Zeichen lang sein.');
	}

	const checkUsername = await getUser(username);
	if (checkUsername) {
		return getResponse('error', 'Benutzername existiert bereits.');
	}

	const user: User = { username, password: generateHash(password), bets: [] };
	const createSuccess = await createUser(user);
	if (!createSuccess) {
		return getResponse('error', 'Fehler beim Erstellen des Benutzers.');
	}

	const success = loginUser(user, password, cookies);
	if (!success) {
		return getResponse('error', 'Fehler beim registrieren des Benutzers');
	}

	// Update cache
	updateCacheUser(user);

	// Successful login
	return getResponse('success', 'Erfolgreich registriert.');
}) satisfies RequestHandler;
