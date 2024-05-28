import { getCurrentStage, getGroupStageMatches, getKnockoutStageMatches } from '$lib/DataHub';
import { getClientUser } from '$lib/server/Auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const groupStageMatches = getGroupStageMatches();
	const knockoutStageMatches = getKnockoutStageMatches();

	const isGroupStage = groupStageMatches.some((group) => group.matches[0].group.groupID == getCurrentStage()?.groupID);
	const currentKnockoutStage = knockoutStageMatches.find((stage) => stage.matches[0].group.groupID == getCurrentStage()?.groupID);

	return { groupStageMatches, knockoutStageMatches, isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), isGroupStage, currentKnockoutStage };
}) satisfies PageServerLoad;
