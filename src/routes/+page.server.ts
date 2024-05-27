import { getGroupStageMatches, getKnockoutStageMatches } from '$lib/DataHub';
import { getClientUser } from '$lib/server/Auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const groupStageMatches = getGroupStageMatches();
	const knockoutStageMatches = getKnockoutStageMatches();

	return { groupStageMatches, knockoutStageMatches, isAuthentificated: locals.isAuthentificated, user: getClientUser(locals.user) };
}) satisfies PageServerLoad;
