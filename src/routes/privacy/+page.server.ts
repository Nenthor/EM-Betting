import page from '../../../static/privacy.html?raw';
import type { PageServerLoad } from './$types';

export const load = (() => {
	return { privacy: page ?? 'Datenschutzerklärung nicht gefunden' };
}) satisfies PageServerLoad;
