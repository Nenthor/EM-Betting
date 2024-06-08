import { PRIVACY_POLICY_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	const page = await fetch(PRIVACY_POLICY_URL);

	if (!page.ok) error(page.status, page.statusText);

	return { privacy: await page.text() };
}) satisfies PageServerLoad;
