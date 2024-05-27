import { logoutUser } from '$lib/server/Auth';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ cookies, locals }) => {
	if (!locals.isAuthentificated) {
		return getResponse('error', 'Sie sind nicht angemeldet.');
	}

	logoutUser(locals.user, cookies);

	// Successful logout
	return getResponse('success', 'Erfolgreich abgemeldet.');
}) satisfies RequestHandler;

function getResponse(type: string, message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
