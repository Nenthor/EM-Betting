<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { getGroupStageMatches, getKnockoutStageMatches, update } from '$lib/DataHub';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let stagesHtml: HTMLDetailsElement[] = [];

	onMount(() => {
		let openIndex = 0;

		if (!data.isGroupStage) {
			const orderId = data.currentKnockoutStage?.matches[0].group.groupOrderID || 0;
			const currentGroupIndex = data.knockoutStageMatches.findIndex((stage) => stage.matches[0].group.groupOrderID === orderId);
			openIndex = currentGroupIndex + 1;
		}

		for (let i = openIndex; i < stagesHtml.length; i++) {
			stagesHtml[i].open = true;
		}
	});

	async function localUpdate() {
		await update();
		data.groupStageMatches = getGroupStageMatches();
		data.knockoutStageMatches = getKnockoutStageMatches();

		data = data;
	}

	async function onLogout() {
		const response = await fetch('/api/logout', {
			method: 'POST'
		});

		if (response.ok) {
			await invalidateAll();
		}
	}

	function getLeagueName() {
		if (data.groupStageMatches.length > 0) {
			return data.groupStageMatches[0].matches[0].leagueName;
		} else {
			return data.knockoutStageMatches[0].matches[0].leagueName;
		}
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/update" on:click|preventDefault={localUpdate}>Aktualisieren</a></li>
	{#if data.isAuthenticated}
		<li><a href="/logout" on:click|preventDefault={onLogout}>Logout</a></li>
	{:else}
		<li><a href="/login">Anmelden</a></li>
	{/if}
</Navbar>

<main>
	<h1 class="title">Alle Spiele der {getLeagueName()}</h1>
	<ul class="stages">
		{#if data.groupStageMatches.length != 0}
			<details class="stage" bind:this={stagesHtml[0]}>
				<summary
					><h2 class="stageName">
						<img src="/images/svg/down.svg" alt="down" />
						<p>Gruppenphase</p>
						<img src="/images/svg/down.svg" alt="down" />
					</h2></summary
				>
				<ul class="groups">
					{#each data.groupStageMatches as group}
						<li class="group">
							<h2 class="groupName">{group.groupName}</h2>
							<ul class="matches">
								{#each group.matches as match}
									<a href="/match/{match.matchID}">
										<MatchItem {match} user={data.user} />
									</a>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			</details>
		{/if}
		<div class="knockout">
			{#each data.knockoutStageMatches as stage, i}
				<details class="stage" bind:this={stagesHtml[i + 1]}>
					<summary
						><h2 class="stageName">
							<img src="/images/svg/down.svg" alt="down" />
							<p>{stage.stageName}</p>
							<img src="/images/svg/down.svg" alt="down" />
						</h2></summary
					>
					<ul class="matches">
						{#each stage.matches as match}
							<a href="/match/{match.matchID}">
								<MatchItem {match} user={data.user} />
							</a>
						{/each}
					</ul>
				</details>
			{/each}
		</div>
	</ul>
</main>

<style>
	main {
		background-image: linear-gradient(to bottom, #2a292a, #c1121c, #ff9b00);
	}

	.title {
		text-align: center;
		margin: 20px;
		color: var(--primary-light);
		max-width: calc(100% - 40px);
		font-size: clamp(1.5rem, 3vw, 3rem);
	}

	.stages {
		padding: 5px 10px;
	}

	.groupName {
		text-align: center;
	}

	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: 25px;
		margin: 10px 25px 0 25px;
		justify-content: space-around;
	}

	.group {
		background-color: #161616;
		border-radius: 20px;
		padding: 10px 40px;
		flex: 0 0 calc(35% - 100px);
	}

	.stage {
		background-color: #323232aa;
		border-radius: 50px 50px;
		margin: 10px 0;
	}

	.stageName {
		text-align: center;
		cursor: pointer;
		padding: 10px 20px;
		background-color: white;
		border-radius: 20px;
		height: 30px;
		line-height: 30px;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		transition: border-radius 0.3s ease-in-out;
	}

	.stageName > p {
		color: #161616;
		min-width: 30vw;
	}

	.stageName > img {
		height: 100%;
	}

	.stage[open] {
		border-radius: 50px 50px 10px 10px;
	}

	.stage[open] .stageName {
		border-radius: 20px 20px 0 0;
	}

	.matches {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin: 10px 0;
		padding-bottom: 20px;
		justify-content: space-around;
	}
</style>
