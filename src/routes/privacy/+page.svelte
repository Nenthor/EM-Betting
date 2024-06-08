<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Navbar></Navbar>

<main>
	<div class="privacy">
		{@html data.privacy}
	</div>
</main>
<Footer />

<style>
	@import '/style/privacy.css';

	.privacy {
		margin: 0 10px 10px 10px;
		width: calc(100% - 20px);
		text-align: center;
		color: white;
	}
</style>
