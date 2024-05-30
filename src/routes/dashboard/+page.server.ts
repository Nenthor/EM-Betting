import { getClientUser } from '$lib/server/Auth';
import { getAllMatches, getUserRanking } from '$lib/server/DataHub';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const ranking = getUserRanking().find((rank) => rank.user.username == locals.user.username)!;

	return { isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), allMatches: getAllMatches(), ranking };
}) satisfies PageServerLoad;
