<script lang="ts">
	import { getBackLink } from '$lib/General';
	import BetStats from '$lib/components/BetStats.svelte';
	import ChangeBet from '$lib/components/ChangeBet.svelte';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import NewBet from '$lib/components/NewBet.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let backLink = '/';

	onMount(() => {
		backLink = getBackLink();
	});

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

	function getWinnerString() {
		const winner = getWinner();
		if (winner) {
			return `${winner.teamName} hat gewonnen!`;
		} else return 'Kein Gewinner';
	}

	function getWinner() {
		if (!data.match.matchIsFinished) return undefined;

		const latestResult = data.match.matchResults.find((result) => result.resultName.includes('Endergebnis'));
		if (!latestResult) return undefined;

		if (latestResult.pointsTeam1 > latestResult.pointsTeam2) {
			return data.match.team1;
		} else if (latestResult.pointsTeam1 < latestResult.pointsTeam2) {
			return data.match.team2;
		} else {
			return undefined;
		}
	}

	function getCurrentWinner() {
		const latestResult = data.match.matchResults
			.filter((result) => result !== undefined)
			.sort((a, b) => a.resultOrderID - b.resultOrderID)
			.pop();
		if (!latestResult) return undefined;

		if (latestResult.pointsTeam1 > latestResult.pointsTeam2) {
			return data.match.team1;
		} else if (latestResult.pointsTeam1 < latestResult.pointsTeam2) {
			return data.match.team2;
		} else {
			return undefined;
		}
	}

	function getCurrentWinnerString() {
		const winner = getCurrentWinner();
		if (winner) {
			return `${winner.teamName} führt!`;
		} else return 'Noch kein Gewinner';
	}

	function getBet() {
		return data.user.bets.find((bet) => bet.matchId === data.match.matchID);
	}

	function hasWonBet() {
		const winner = getWinner();
		const bet = getBet();
		if (!winner || !bet) return false;

		return winner.teamId === bet.teamId;
	}

	function isWinningBet() {
		const winner = getCurrentWinner();
		const bet = getBet();
		if (!winner || !bet) return false;

		return winner.teamId === bet.teamId;
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href={backLink}>Zurück</a></li>
</Navbar>

<main>
	<div class="standingBox">
		<div class="standing">
			<h2>{getMatchStatus()}</h2>
			<MatchItem match={data.match} user={data.defaultUser} />
		</div>
	</div>
	<div class="bet">
		{#if !data.isAuthenticated}
			<div class="betInfo">
				<p>Du musst angemeldet sein, um eine Wette abzugeben</p>
				<a href="/login?from={data.match.matchID}">Melde dich jetzt an</a>
			</div>
		{:else if data.match.matchIsFinished}
			<div class="betInfo">
				<p>Spiel beendet. {getWinnerString()}</p>
				{#if getBet()}
					<p>Damit hast du <span class={hasWonBet() ? 'success' : 'failure'}>{hasWonBet() ? 'richtig' : 'falsch'}</span> gewettet!</p>
				{:else}
					<p><i>Keine Wette abgegeben.</i></p>
				{/if}
			</div>
		{:else if new Date(data.match.matchDateTime).getTime() < Date.now()}
			<div class="betInfo">
				<p>Spiel läuft noch. {getCurrentWinnerString()}</p>
				{#if getBet()}
					<p>Damit hast du momentan <span class={isWinningBet() ? 'success' : 'failure'}>{isWinningBet() ? 'richtig' : 'falsch'}</span> gewettet!</p>
				{:else}
					<p><i>Keine Wette abgegeben.</i></p>
				{/if}
			</div>
		{:else if data.match.team1.teamName.includes('TBD') || data.match.team2.teamName.includes('TBD')}
			<div class="betInfo">
				<p>Wetten sind erst möglich, wenn beide Teams feststehen.</p>
				<a href="/">Zurück</a>
			</div>
		{:else if data.user.bets.find((bet) => bet.matchId === data.match.matchID)}
			<ChangeBet {data} />
		{:else}
			<NewBet {data} />
		{/if}

		{#if data.matchBets.length > 0}
			<div class="stats">
				<BetStats {data} />
			</div>
		{/if}
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
		padding: 10px clamp(5px, 4vw, 50px);
		margin: 0 15px;
		max-width: fit-content;
		flex-grow: 1;
		gap: 10px;
		background-color: #646464;
		border-radius: 0 0 50px 50px;
	}

	.standing > h2 {
		text-align: center;
	}

	.bet {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 50px;
	}

	.betInfo {
		margin-top: 50px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 10px;
		padding: 10px;
		text-align: center;
	}

	.betInfo > a {
		width: max-content;
		color: var(--success);
		background-color: white;
		transition: all 0.33s;
		text-decoration: none;
		font-size: larger;
		font-weight: bold;
		padding: 10px 30px;
		border-radius: 50px;
		min-width: 150px;
		text-align: center;
	}

	.betInfo > a:hover {
		color: white;
		background-color: var(--success);
	}

	p > .success {
		color: var(--success);
		font-weight: bold;
	}

	p > .failure {
		color: var(--error);
		font-weight: bold;
	}
</style>
