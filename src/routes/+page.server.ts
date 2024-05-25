import { getGroupStageMatches, getKnockoutStageMatches } from '$lib/DataHub';
import type { PageServerLoad } from './$types';

export const load = (async ({}) => {
	const groupStageMatches = getGroupStageMatches();
	const knockoutStageMatches = getKnockoutStageMatches();

	return { groupStageMatches, knockoutStageMatches };
}) satisfies PageServerLoad;
