import { getClientUser } from '$lib/server/Auth';
import { getAllMatches, getUserRanking } from '$lib/server/DataHub';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const allRanking = getUserRanking();

	const ranking = allRanking.find((rank) => rank.user.username == locals.user.username)!;
	const maxRank = allRanking[allRanking.length - 1].rank;

	return { isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), allMatches: getAllMatches(), ranking, maxRank };
}) satisfies PageServerLoad;
