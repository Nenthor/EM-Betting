<script lang="ts">
	import { getMatch, update } from '$lib/DataHub';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	async function localUpdate() {
		await update();
		const updatedMatch = getMatch(data.match.matchID);
		if (updatedMatch) {
			data.match = updatedMatch;
			data = data;
		}
	}

	function getMatchStatus() {
		let status = '';
		if (Date.now() > new Date(data.match.matchDateTime).getTime() && !data.match.matchIsFinished) {
			status = 'Spiel läuft';
		} else if (data.match.matchIsFinished) {
			const latestResult = data.match.matchResults.find((result) => result.resultName.includes('Endergebnis'))!;
			if (latestResult.pointsTeam1 > latestResult.pointsTeam2) {
				status = data.match.team1.teamName + ' hat gewonnen';
			} else if (latestResult.pointsTeam1 < latestResult.pointsTeam2) {
				status = data.match.team2.teamName + ' hat gewonnen';
			} else {
				status = 'Unentschieden';
			}

			const extraTimeResult = data.match.matchResults.find((result) => result.resultName.includes('Verlängerung'));
			const penaltyResult = data.match.matchResults.find((result) => result.resultName.includes('Elfmeterschießen'));
			if (penaltyResult && penaltyResult.pointsTeam1 && penaltyResult.pointsTeam2) {
				status += ' (n.E.)';
			} else if (extraTimeResult && extraTimeResult.pointsTeam1 && extraTimeResult.pointsTeam2) {
				status += ' (n.V.)';
			}
		} else {
			const diff = new Date(data.match.matchDateTime).getTime() - Date.now();
			const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

			status = `Spiel beginnt in`;

			if (diffDays <= 1) {
				const diffHours = Math.floor(diff / (1000 * 60 * 60));
				const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				status += ` ${diffHours}h ${diffMinutes}min`;
			} else {
				status += ` ${diffDays} Tagen`;
			}
		}
		return status;
	}
</script>

<Navbar>
	<li><a href="/update" on:click|preventDefault={localUpdate}>Aktualisieren</a></li>
</Navbar>

<main>
	<div class="standingBox">
		<div class="standing">
			<h2>{getMatchStatus()}</h2>
			<MatchItem match={data.match} />
		</div>
	</div>
</main>

<style>
	.standingBox {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.standing {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		justify-content: center;
		padding: 10px 30px;
		max-width: 750px;
		flex-grow: 1;
		gap: 10px;
		background-color: #646464;
		border-radius: 0 0 50px 50px;
	}
</style>
