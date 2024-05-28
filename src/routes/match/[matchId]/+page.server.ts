import { getGroupStageMatches, getMatch } from '$lib/DataHub';
import { getClientUser } from '$lib/server/Auth';
import { getQueryBets } from '$lib/server/Database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const match = getMatch(params.matchId);
	if (!match) error(404, 'Match not found');

	const isGroupStageMatch = getGroupStageMatches().find((group) => group.matches.find((m) => m.matchID == match.matchID)) !== undefined;

	const matchBets = await getQueryBets('matchId', '==', match.matchID, 'createdBy', 'asc').then((bets) => bets.filter((bet) => bet.createdBy !== locals.user.username));

	return { match, isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), isGroupStageMatch, matchBets };
}) satisfies PageServerLoad;
