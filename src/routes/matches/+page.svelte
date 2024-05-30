<script lang="ts">
	import { onLogout } from '$lib/General';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let openStages: boolean[] = getInitOpenStages();
	let matchesHtml: HTMLElement[] = [];

	let readyToAnimate = false;

	function getInitOpenStages() {
		const initOpenStages = [];
		for (let i = 0; i < data.knockoutStageMatches.length + 1; i++) {
			initOpenStages[i] = i >= getOpenStatus();
		}
		return initOpenStages;
	}

	onMount(() => {
		setTimeout(() => {
			readyToAnimate = true;
		}, 100);
	});

	function getOpenStatus() {
		if (data.isGroupStage) return 0;
		const orderId = data.currentKnockoutStage?.matches[0].group.groupOrderID || 0;
		const currentGroupIndex = data.knockoutStageMatches.findIndex((stage) => stage.matches[0].group.groupOrderID === orderId);
		return currentGroupIndex + 1;
	}

	function getLeagueName() {
		if (data.groupStageMatches.length > 0) {
			return data.groupStageMatches[0].matches[0].leagueName;
		} else {
			return data.knockoutStageMatches[0].matches[0].leagueName;
		}
	}

	function resetAnimation(i: number) {
		if (!readyToAnimate) {
			matchesHtml[i].classList.add('sweepInstant');
			return;
		}

		if (openStages[i]) {
			matchesHtml[i].classList.add('sweep');
		} else {
			matchesHtml[i].classList.remove('sweep');
			matchesHtml[i].classList.remove('sweepInstant');
			void matchesHtml[i].offsetWidth;
		}
	}
</script>

<Navbar addHomeLink={false}>
	{#if data.isAuthenticated}
		<li><a href="/dashboard">Dashboard</a></li>
		<li><a href="/ranking?from=matches">Rangliste</a></li>
		<li><a href="/logout" on:click|preventDefault={onLogout}>Logout</a></li>
	{:else}
		<li><a href="/login">Anmelden</a></li>
	{/if}
</Navbar>

<main>
	<h1 class="title">Alle Spiele der {getLeagueName()}</h1>
	<p class="info">
		Klicke ein Spiel an, um auf dein Favoriten-Team zu wetten. Mit <img src="/images/svg/star.svg" alt="selected" width="20px" />-versehenen Mannschaften sind deine bisherigen Wetten. Einreichungen
		sind nur bis kurz vor Anpfiff möglich. Viel Erfolg!
	</p>
	<ul class="stages">
		{#if data.groupStageMatches.length != 0}
			<details class="stage" bind:open={openStages[0]} on:toggle={() => resetAnimation(0)}>
				<summary
					><h2 class="stageName">
						<img src="/images/svg/down.svg" alt="down" class={openStages[0] ? 'arrowTurnRight' : ''} />
						<p>Gruppenphase</p>
						<img src="/images/svg/down.svg" alt="down" class={openStages[0] ? 'arrowTurnLeft' : ''} />
					</h2></summary
				>
				<ul class="groups" bind:this={matchesHtml[0]}>
					{#each data.groupStageMatches as group}
						<li class="group">
							<h2 class="groupName">{group.groupName}</h2>
							<ul class="matches">
								{#each group.matches as match}
									<a href="/match/{match.matchID}?from=matches">
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
				<details class="stage" bind:open={openStages[i + 1]} on:toggle={() => resetAnimation(i + 1)}>
					<summary
						><h2 class="stageName">
							<img src="/images/svg/down.svg" alt="down" class={openStages[i + 1] ? 'arrowTurnRight' : ''} />
							<p>{stage.stageName}</p>
							<img src="/images/svg/down.svg" alt="down" class={openStages[i + 1] ? 'arrowTurnLeft' : ''} />
						</h2></summary
					>
					<ul class="matches" bind:this={matchesHtml[i + 1]}>
						{#each stage.matches as match}
							<a href="/match/{match.matchID}?from=matches">
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
		font-size: clamp(1.5rem, 4vw, 3rem);
	}

	.info {
		text-align: center;
		margin: 0 20px 20px 20px;
		font-size: clamp(1rem, 2vw, 1.2rem);
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
		align-items: center;
	}

	.group {
		background-color: #161616dd;
		border-radius: 20px;
		padding: 10px clamp(5px, 2vw, 40px);
		flex: 0 0 45%;
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
		border-radius: 10px;
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
		user-select: none;
	}

	.stageName > img {
		height: 100%;
		transition: all 0.3s ease-in-out;
	}

	.stage[open] {
		border-radius: 50px 50px 10px 10px;
		padding-bottom: 12.5px;
	}

	.stage[open] .stageName {
		border-radius: 20px 20px 0 0;
	}

	.matches {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		justify-content: space-around;
		padding-top: 12.5px;
	}

	.stage > ul {
		opacity: 0;
	}

	:global(.sweep) {
		animation: sweep 0.75s ease-out forwards;
	}

	:global(.sweepInstant) {
		opacity: 1 !important;
	}

	@keyframes sweep {
		0% {
			opacity: 0;
			transform: translateX(-15px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.arrowTurnRight {
		transform: rotate(-90deg);
	}

	.arrowTurnLeft {
		transform: rotate(90deg);
	}

	@media (max-width: 1700px) {
		.groups {
			flex-direction: column;
		}
	}
</style>
