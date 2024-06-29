<script lang="ts">
	import { isMatchWinner } from '$lib/General';
	import BetStats from '$lib/components/BetStats.svelte';
	import ChangeBet from '$lib/components/ChangeBet.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import NewBet from '$lib/components/NewBet.svelte';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	const user = writable(data.user);
	setContext('user', user);

	let currentDate = Date.now();

	onMount(() => {
		const interval = setInterval(() => (currentDate = Date.now()), 1000 * 60);
		return () => clearInterval(interval);
	});

	function getMatchStatus(data: PageData, currentDate: number) {
		let status = '';
		if (currentDate > new Date(data.match.matchDateTimeUTC).getTime() && !data.match.matchIsFinished) {
			status = 'Spiel läuft';
		} else if (data.match.matchIsFinished) {
			const latestResult = data.match.matchResults.find((result) => result.resultName.includes('Endergebnis'))!;
			if (!latestResult) return 'Warte auf Ergebnis';

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
			const diff = new Date(data.match.matchDateTimeUTC).getTime() - currentDate;
			const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

			status = `Spiel beginnt in`;

			if (diffDays <= 1) {
				const diffHours = Math.floor(diff / (1000 * 60 * 60));
				const diffMinutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));
				status += ` ${diffHours}h ${diffMinutes}min`;
			} else {
				status += ` ${diffDays} Tagen`;
			}
		}
		return status;
	}

	function getWinnerString(data: PageData) {
		const winner = getWinner(data);
		if (winner) {
			return `${winner.teamName} hat gewonnen!`;
		} else return 'Kein Gewinner';
	}

	function getWinner(data: PageData) {
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

	function getCurrentWinner(data: PageData) {
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

	function getCurrentWinnerString(data: PageData) {
		const winner = getCurrentWinner(data);
		if (winner) {
			return `${winner.teamName} führt!`;
		} else return 'Noch kein Gewinner';
	}

	function getBet(data: PageData) {
		return $user.bets.find((bet) => bet.matchId === data.match.matchID);
	}

	function hasWonBet(data: PageData) {
		const bet = getBet(data);
		if (!bet) return false;
		return isMatchWinner(data.match, bet.teamId);
	}
</script>

<Navbar addHomeLink={false}>
	<li>
		<a href="/back" on:click|preventDefault={() => history.back()}>Zurück</a>
	</li>
</Navbar>

<main>
	<div class="standingBox">
		<div class="standing">
			<h2>{getMatchStatus(data, currentDate)}</h2>
			<MatchItem match={data.match} user={data.defaultUser} />
		</div>
	</div>
	<div class="bet">
		{#if !data.isAuthenticated}
			{#if data.allowAuth}
				<div class="betInfo">
					<p>Du musst angemeldet sein, um eine Wette abzugeben</p>
					<a href="/login?from={data.match.matchID}">Melde dich jetzt an</a>
				</div>
			{:else}
				<div class="betInfo">
					<p>Anmelden ist nicht mehr möglich - Projekt abgeschlossen.</p>
				</div>
			{/if}
		{:else if data.match.matchIsFinished}
			<div class="betInfo">
				<p>Spiel beendet. {getWinnerString(data)}</p>
				{#if getBet(data)}
					<p>Damit hast du <span class={hasWonBet(data) ? 'success' : 'failure'}>{hasWonBet(data) ? 'richtig' : 'falsch'}</span> gewettet!</p>
				{:else}
					<p><i>Keine Wette abgegeben.</i></p>
				{/if}
			</div>
		{:else if new Date(data.match.matchDateTimeUTC).getTime() < Date.now()}
			<div class="betInfo">
				<p>Spiel läuft noch. {getCurrentWinnerString(data)}</p>
				{#if getBet(data)}
					<p>Damit hast du momentan <span class={hasWonBet(data) ? 'success' : 'failure'}>{hasWonBet(data) ? 'richtig' : 'falsch'}</span> gewettet!</p>
				{:else}
					<p><i>Keine Wette abgegeben.</i></p>
				{/if}
			</div>
		{:else if data.match.team1.teamName.includes('noch offen') || data.match.team2.teamName.includes('noch offen')}
			<div class="betInfo">
				<p>Wetten sind erst möglich, wenn beide Teams feststehen.</p>
				<a href="/back" on:click|preventDefault={() => history.back()}>Zurück</a>
			</div>
		{:else if $user.bets.find((bet) => bet.matchId === data.match.matchID)}
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
<Footer />

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
		margin-bottom: 20px;
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
		color: var(--success-dark);
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
		background-color: var(--success-dark);
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
