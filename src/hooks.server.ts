import { update } from '$lib/DataHub';
import type { Handle } from '@sveltejs/kit';

// Executes before route specific hooks
export const handle: Handle = (async ({ event, resolve }) => {
	await update(); // with cache system

	return resolve(event);
}) satisfies Handle;
