import { getResponse } from '$lib/General';
import { logoutUser } from '$lib/server/Auth';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ cookies, locals }) => {
	if (!locals.isAuthenticated) {
		return getResponse('error', 'Sie sind nicht angemeldet.');
	}

	logoutUser(locals.user, cookies);

	// Successful logout
	return getResponse('success', 'Erfolgreich abgemeldet.');
}) satisfies RequestHandler;
