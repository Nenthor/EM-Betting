import { getAllMatches } from '$lib/DataHub';
import { getClientUser } from '$lib/server/Auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return { isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), allMatches: getAllMatches() };
}) satisfies PageServerLoad;
