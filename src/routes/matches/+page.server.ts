import { STOP_AUTH } from '$env/static/private';
import { getClientUser } from '$lib/server/Auth';
import { getCurrentStage, getGroupStageMatches, getKnockoutStageMatches } from '$lib/server/DataHub';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const groupStageMatches = getGroupStageMatches();
	const knockoutStageMatches = getKnockoutStageMatches();

	const isGroupStage = groupStageMatches.some((group) => group.matches[0].group.groupID == getCurrentStage()?.groupID);
	const currentKnockoutStage = knockoutStageMatches.find((stage) => stage.matches[0].group.groupID == getCurrentStage()?.groupID);

	const allowAuth = STOP_AUTH !== 'true';

	return { groupStageMatches, knockoutStageMatches, isAuthenticated: locals.isAuthenticated, user: getClientUser(locals.user), isGroupStage, currentKnockoutStage, allowAuth };
}) satisfies PageServerLoad;
