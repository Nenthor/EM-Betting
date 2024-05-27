<script>
	import Authentication from '$lib/components/Authentication.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Navbar>
	<li><a href="/register">Registrieren</a></li>
</Navbar>

<main>
	<Authentication authType="login" />
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
