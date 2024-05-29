<script>
	import { invalidateAll } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';

	async function onLogout() {
		const response = await fetch('/api/logout', {
			method: 'POST'
		});

		if (response.ok) {
			await invalidateAll();
		}
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/matches">Matches</a></li>
	<li><a href="/logout" on:click|preventDefault={onLogout}>Logout</a></li>
</Navbar>
