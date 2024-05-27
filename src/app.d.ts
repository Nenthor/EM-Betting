// See https://kit.svelte.dev/docs/types#app

import type { User } from '$lib/server/Database';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isAuthentificated: boolean;
			user: User;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
