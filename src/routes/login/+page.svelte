<script lang="ts">
	import Authentication from '$lib/components/Authentication.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	let from: String | null = null;
	onMount(() => {
		const serachParams = new URLSearchParams(location.search);
		from = serachParams.get('from');
	});
</script>

<Navbar addHomeLink={false}>
	<li><a href="/register{from ? `?from=${from}` : ''}">Registrieren</a></li>
	{#if from}
		<li><a href="/match/{from}">Zurück</a></li>
	{:else}
		<li><a href="/matches">Matches</a></li>
	{/if}
</Navbar>

<main>
	<Authentication authType="login" />
</main>
<Footer />

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
