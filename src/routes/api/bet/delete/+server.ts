import { getResponse } from '$lib/General';
import { getMatch, updateCacheBet, updateCacheUser } from '$lib/server/DataHub';
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

	// Remove bet from cache
	updateCacheBet(bet, true);
	locals.user.bets = locals.user.bets.filter((b) => b.id !== bet.id);
	updateCacheUser(locals.user);

	// Successfully removed bet
	return getResponse('success', 'Wette erfolgreich gelöscht.');
}) satisfies RequestHandler;
