import { getGroupStageMatches, getMatch } from '$lib/DataHub';
import { getClientUser } from '$lib/server/Auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const match = getMatch(params.matchId);
	if (!match) error(404, 'Match not found');

	const isGroupStageMatch = getGroupStageMatches().find((group) => group.matches.find((m) => m.matchID == match.matchID)) !== undefined;

	return { match, isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), isGroupStageMatch };
}) satisfies PageServerLoad;
