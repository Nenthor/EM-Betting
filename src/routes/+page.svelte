<script lang="ts">
	import { getGroupStageMatches, getKnockoutStageMatches, update } from '$lib/DataHub';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	async function localUpdate() {
		await update();
		data.groupStageMatches = getGroupStageMatches();
		data.knockoutStageMatches = getKnockoutStageMatches();

		data = data;
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/update" on:click|preventDefault={localUpdate}>Aktualisieren</a></li>
</Navbar>

<main>
	<h1 class="title">Verfügbare Spiele</h1>
	<ul class="stages">
		{#if data.groupStageMatches.length != 0}
			<li class="stage">
				<h2 class="stageName">Gruppenphase</h2>
				<ul class="groups">
					{#each data.groupStageMatches as group}
						<li class="group">
							<h2 class="groupName">{group.groupName}</h2>
							<ul class="matches">
								{#each group.matches as match}
									<a href="/match/{match.matchID}">
										<MatchItem {match} />
									</a>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			</li>
		{/if}
		<div class="knockout">
			{#each data.knockoutStageMatches as stage}
				<li class="stage">
					<h2 class="stageName">{stage.stageName}</h2>
					<ul class="matches">
						{#each stage.matches as match}
							<a href="/match/{match.matchID}">
								<MatchItem {match} />
							</a>
						{/each}
					</ul>
				</li>
			{/each}
		</div>
	</ul>
</main>

<style>
	.title {
		text-align: center;
	}

	.stages {
		padding: 5px 10px;
		background-image: linear-gradient(to bottom, #2a292a, #c1121c, #ff9b00);
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

	.knockout {
		margin-top: 10px;
	}

	.stage {
		background-color: #323232aa;
		border-radius: 10px;
		padding: 5px 20px 20px 20px;
		margin: 10px 0;
	}

	.stageName {
		text-align: center;
	}

	.matches {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin: 10px 0;
		justify-content: space-around;
	}
</style>
