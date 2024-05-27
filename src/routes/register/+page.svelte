<script>
	import Authentication from '$lib/components/Authentication.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Navbar>
	<li><a href="/login">Anmelden</a></li>
</Navbar>

<main>
	<Authentication authType="register" />
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
