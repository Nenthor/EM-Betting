import { getClientUser } from '$lib/server/Auth';
import { getAllMatches, getUserRanking } from '$lib/server/DataHub';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return { allMatches: getAllMatches(), user: getClientUser(locals.user), ranking: getUserRanking() };
}) satisfies PageServerLoad;
