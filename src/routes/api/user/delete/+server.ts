import { getResponse } from '$lib/General';
import { logoutUser } from '$lib/server/Auth';
import { updateCacheUser } from '$lib/server/DataHub';
import { removeUser } from '$lib/server/Database';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ locals, cookies }) => {
	if (!locals.isAuthenticated) {
		return getResponse('error', 'Nicht angemeldet.');
	}

	const success = await removeUser(locals.user);

	if (!success) {
		return getResponse('error', 'Benutzer konnte nicht entfernt werden.');
	}

	// remove session cookie
	logoutUser(cookies);

	// update cache
	updateCacheUser(locals.user, true); // bets are removed as well

	// Successful login
	return getResponse('success', 'Erfolgreich angemeldet.');
}) satisfies RequestHandler;
