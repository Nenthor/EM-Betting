import { getMatch } from '$lib/DataHub';
import { removeUserFromCache } from '$lib/server/Auth';
import { addBet, setBet } from '$lib/server/Database';
import { type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, locals }) => {
	const matchId = parseInt(request.headers.get('matchId') ?? '-1');
	const teamId = parseInt(request.headers.get('teamId') ?? '-1');

	if (matchId == -1 || teamId == -1) {
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
	if (match.team1.teamName.includes('TBD') || match.team2.teamName.includes('TBD')) {
		return getResponse('error', 'Teams noch nicht bekannt.');
	}

	let bet = locals.user.bets.find((bet) => bet.matchId === matchId);
	let success = false;
	if (bet) {
		// Bet already exists - update it
		if (bet.teamId === teamId) {
			return getResponse('error', 'Wette bereits eingereicht.');
		}
		bet.teamId = teamId;
		success = await setBet(bet);
	} else {
		// Bet does not exist - create it
		bet = await addBet({ id: '', createdBy: locals.user.username, matchId, teamId });
		success = !!bet;
	}

	if (!success) {
		return getResponse('error', 'Fehler beim Einreichen der Wette.');
	}

	// Successfully bet
	removeUserFromCache(locals.user.username);
	return getResponse('success', 'Wette erfolgreich eingereicht.');
}) satisfies RequestHandler;

function getResponse(type: string, message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
