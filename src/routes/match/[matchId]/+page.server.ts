import { getMatch } from '$lib/DataHub';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const match = getMatch(params.matchId);
	if (!match) error(404, 'Match not found');

	return { match };
}) satisfies PageServerLoad;
