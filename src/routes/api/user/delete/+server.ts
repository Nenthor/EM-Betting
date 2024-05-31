import { getResponse } from '$lib/General';
import { logoutUser, removeUserFromCache } from '$lib/server/Auth';
import { update } from '$lib/server/DataHub';
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

	// logout user - remove session cookie
	logoutUser(locals.user, cookies);

	// invalidate user cache & update data
	removeUserFromCache(locals.user.username);
	await update(true);

	// Successful login
	return getResponse('success', 'Erfolgreich angemeldet.');
}) satisfies RequestHandler;
