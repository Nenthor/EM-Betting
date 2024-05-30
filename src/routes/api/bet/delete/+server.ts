import { removeUserFromCache } from '$lib/server/Auth';
import { getMatch, update } from '$lib/server/DataHub';
import { removeBet } from '$lib/server/Database';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, locals }) => {
	const matchId = parseInt(request.headers.get('matchId') ?? '-1');

	if (matchId == -1) {
		return getResponse('error', 'matchId oder teamId fehlen.');
	}
	if (!locals.isAuthenticated) {
		return getResponse('error', 'Nicht authentifiziert.');
	}
	const match = getMatch(matchId);
	if (!match) {
		return getResponse('error', 'Match nicht gefunden.');
	}
	if (new Date(match.matchDateTime).getTime() < Date.now()) {
		return getResponse('error', 'Match bereits gestartet.');
	}

	let bet = locals.user.bets.find((bet) => bet.matchId === matchId);
	if (!bet) {
		return getResponse('error', 'Wette nicht gefunden.');
	}

	const success = await removeBet(bet.id);
	if (!success) {
		return getResponse('error', 'Wette konnte nicht entfernt werden.');
	}

	await update(true);

	// Successfully removed bet
	removeUserFromCache(locals.user.username);
	return getResponse('success', 'Wette erfolgreich gelöscht.');
}) satisfies RequestHandler;

function getResponse(type: string, message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
