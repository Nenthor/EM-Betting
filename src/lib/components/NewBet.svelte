<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { User } from '$lib/server/Database';
	import type { Match, Team } from '$lib/server/OpenLiga';
	import { onMount } from 'svelte';

	export let data: {
		match: Match;
		isAuthenticated: boolean;
		user: User;
		isGroupStageMatch: boolean;
	};

	let selectedTeam = data.match.team1;
	let matchSelectHtml: HTMLDivElement;
	let fetching = false;
	let lastSize = 0;

	onMount(() => {
		lastSize = window.innerWidth;
		window.addEventListener('resize', fixResizeSelection);

		return () => {
			window.removeEventListener('resize', fixResizeSelection);
		};
	});

	function fixResizeSelection() {
		if (selectedTeam === data.match.team1) return;

		if ((lastSize > 450 && window.innerWidth <= 450) || (lastSize <= 450 && window.innerWidth > 450)) {
			onTeamSelect(data.match.team1);
		}
		lastSize = window.innerWidth;
	}

	function onTeamSelect(team: Team) {
		if (selectedTeam === team) return;
		selectedTeam = team;

		let keyframes: Keyframe[] = [{ transform: 'translateX(-1px)' }, { transform: 'translateX(calc(175px + 5px - 1px))' }];

		if (window.innerWidth <= 450) {
			keyframes = [{ transform: 'translateX(-1px)' }, { transform: 'translateX(calc(130px + 5px - 1px))' }];
		}

		const options: KeyframeAnimationOptions = {
			duration: 333,
			iterations: 1,
			fill: 'forwards',
			easing: 'ease-in-out'
		};
		if (selectedTeam === data.match.team1) {
			matchSelectHtml.animate(keyframes.reverse(), options);
		} else {
			matchSelectHtml.animate(keyframes, options);
		}
	}

	async function submitBet() {
		if (fetching) return;
		fetching = true;

		const response = await fetch('/api/bet/set', {
			method: 'POST',
			headers: {
				matchId: data.match.matchID.toString(),
				teamId: selectedTeam.teamId.toString()
			}
		});

		if (!response.ok) {
			console.error('Failed to submit bet');
		}

		const json = await response.json();
		if (json.type === 'success') {
			await invalidateAll();
		}

		fetching = false;
	}
</script>

<div class="box">
	<h2>Wette abgeben</h2>
	<form>
		<div class="team">
			<p>Auf welches Team setzten:</p>
			<div class="teamSlider">
				<button on:click={() => onTeamSelect(data.match.team1)} style="color: {selectedTeam == data.match.team1 ? 'white' : 'black'}">{data.match.team1.teamName}</button>
				<button on:click={() => onTeamSelect(data.match.team2)} style="color: {selectedTeam == data.match.team2 ? 'white' : 'black'}">{data.match.team2.teamName}</button>
				<div bind:this={matchSelectHtml} id="teamSelect"></div>
			</div>
		</div>
		<button on:click|preventDefault={submitBet} id="submit">Wette einreichen</button>
		{#if data.isGroupStageMatch}
			<p class="groupStageInfo">Das Wetten auf Unentschieden ist nicht möglich.</p>
		{/if}
	</form>
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px clamp(5px, 2vw, 20px);
		margin: 50px 20px 0 20px;
		gap: 10px;
		background-color: #646464;
		border-radius: 20px;
		max-width: 350px;
	}

	#submit {
		width: max-content;
		padding-left: 40px;
		padding-right: 40px;
	}

	#submit {
		color: var(--success);
		background-color: white;
		transition: all 0.33s;
	}

	#submit:hover {
		color: white;
		background-color: var(--success);
	}

	.box > form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.team > p {
		color: white;
		text-align: center;
		margin-bottom: 5px;
	}

	.groupStageInfo {
		color: white;
		text-align: center;
		text-wrap: wrap;
		font-style: italic;
	}

	.teamSlider {
		display: flex;
		position: relative;
		justify-content: space-evenly;
		align-items: center;
		gap: 10px;
		background-color: white;
		padding: 10px 0;
		border-radius: 20px;
		overflow-x: hidden;
		z-index: 1;
	}

	.teamSlider > button {
		background-color: transparent;
		padding: 0;
		margin: 0;
		border-radius: 0;
		width: 175px;
		transition: color 0.5s;
	}

	#teamSelect {
		position: absolute;
		height: 100%;
		width: calc(175px + 5px + 1px);
		background-color: var(--primary);
		left: 0;
		transform: translateX(-1px);
		padding: 0;
		z-index: -1;
		border-radius: 20px;
	}

	@media (max-width: 450px) {
		.teamSlider > button {
			width: 130px;
		}

		#teamSelect {
			width: calc(130px + 5px + 1px);
		}
	}
</style>
