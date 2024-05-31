import { getResponse } from '$lib/General';
import { checkDataIntegrity, loginUser } from '$lib/server/Auth';
import { getUser } from '$lib/server/Database';
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

	const user = await getUser(username);
	if (!user) {
		return getResponse('error', 'Benutzer existiert nicht.');
	}

	const success = await loginUser(user, password, cookies);
	if (!success) {
		return getResponse('error', 'Benuztername oder Passwort ist falsch.');
	}

	// Successful login
	return getResponse('success', 'Erfolgreich angemeldet.');
}) satisfies RequestHandler;
