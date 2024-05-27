import { checkDataIntegrity, generateHash, loginUser } from '$lib/server/Auth';
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

	const checkUsername = await getUser(username);
	if (checkUsername) {
		return getResponse('error', 'Benutzername existiert bereits.');
	}

	const user: User = { username, password: generateHash(password), photoURL: 'default', bets: [] };
	const createSuccess = await createUser(user);
	if (!createSuccess) {
		return getResponse('error', 'Fehler beim Erstellen des Benutzers.');
	}

	const success = await loginUser(user, password, cookies);
	if (!success) {
		return getResponse('error', 'Fehler beim registrieren des Benutzers');
	}

	// Successful login
	return getResponse('success', 'Erfolgreich registriert.');
}) satisfies RequestHandler;

function getResponse(type: string, message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
