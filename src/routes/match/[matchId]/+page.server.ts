import { STOP_AUTH } from '$env/static/private';
import { getClientUser } from '$lib/server/Auth';
import { defaultUser, getAllBetsForMatch, getGroupStageMatches, getMatch } from '$lib/server/DataHub';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ params, locals }) => {
	const match = getMatch(params.matchId);
	if (!match) error(404, 'Match not found');

	const isGroupStageMatch = getGroupStageMatches().find((group) => group.matches.find((m) => m.matchID == match.matchID)) !== undefined;
	const matchBets = getAllBetsForMatch(match.matchID).filter((bet) => bet.createdBy !== locals.user.username);

	const allowAuth = STOP_AUTH !== 'true';

	return { match, isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), isGroupStageMatch, matchBets, allowAuth, defaultUser };
}) satisfies PageServerLoad;
