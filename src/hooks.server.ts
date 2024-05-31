import { getUserFromCookies } from '$lib/server/Auth';
import { defaultUser, update } from '$lib/server/DataHub';
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';

const onlyNonAuthRouts = ['/login', '/api/user/login', '/register', '/api/user/register'];
const onlyAuthRouts = ['/dashboard', '/api/user/logout', '/api/user/delete', '/api/bet/set', '/api/bet/delete'];

// Executes before route specific hooks
export const handle: Handle = (async ({ event, resolve }) => {
	await update(); // with cache system

	const user = await getUserFromCookies(event.cookies);

	if (!user && onlyAuthRouts.includes(event.url.pathname)) {
		// User is not authentificated and tries to access a protected route
		redirect(301, '/login');
	}
	if (user && onlyNonAuthRouts.includes(event.url.pathname)) {
		// User is authentificated and tries to access a non authenticated route
		redirect(301, '/dashboard');
	}

	if (event.url.pathname === '/') {
		if (user) redirect(301, '/dashboard');
		else redirect(301, '/matches');
	}

	event.locals = {
		isAuthenticated: !!user,
		user: user || defaultUser
	};

	return resolve(event);
}) satisfies Handle;

// Executes when an error is thrown in a route. Ignores 404 errors
export const handleError: HandleServerError = (async ({ error, status, message }) => {
	if (status === 404) {
		console.log(`${error}`.split('\n')[0].replace('Error:', '404'));
	} else console.error(error);

	return {
		message,
		status
	};
}) satisfies HandleServerError;
