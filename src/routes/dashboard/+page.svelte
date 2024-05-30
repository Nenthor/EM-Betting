<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Match } from '$lib/OpenLiga';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const MAX_SELECTED_MATCHES = 5;

	let nonBetMatches = getNonBetMatches();
	let historyMatches = getHistoryMatches();

	async function onLogout() {
		const response = await fetch('/api/logout', {
			method: 'POST'
		});

		if (response.ok) {
			goto('/matches');
		}
	}

	function getWinRatio() {
		let finishedMatches = 0;
		const wins = data.user.bets.filter((bet) => {
			const winner = getMatchWinner(bet.matchId);
			if (winner != 0) finishedMatches++;
			return winner === bet.teamId;
		}).length;

		if (finishedMatches === 0) return 0;
		return wins / finishedMatches;
	}

	function getMatchWinner(matchId: number) {
		const match = data.allMatches.find((match) => match.matchID === matchId);
		if (!match || !match.matchResults || match.matchResults.length == 0) return 0;

		const endResult = match.matchResults.find((m) => m.resultName.includes('Endergebnis'));

		if (endResult) {
			if (endResult.pointsTeam1 > endResult.pointsTeam2) return match.team1.teamId;
			if (endResult.pointsTeam1 < endResult.pointsTeam2) return match.team2.teamId;
			return 0;
		}

		const latestResult = match.matchResults[match.matchResults.length - 1];
		if (latestResult.pointsTeam1 > latestResult.pointsTeam2) return match.team1.teamId;
		if (latestResult.pointsTeam1 < latestResult.pointsTeam2) return match.team2.teamId;
		return 0;
	}

	function getNonBetMatches() {
		const select: Match[] = [];

		for (const match of data.allMatches) {
			if (select.length >= MAX_SELECTED_MATCHES) break;
			if (!match.matchDateTime || new Date(match.matchDateTime) < new Date()) continue;
			if (match.team1.teamName.includes('TBD') || match.team2.teamName.includes('TBD')) continue;
			if (!data.user.bets.some((bet) => bet.matchId === match.matchID)) {
				select.push(match);
			}
		}

		return select.sort((a, b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime());
	}

	function getHistoryMatches() {
		const betMatches: Match[] = [];
		for (const bet of data.user.bets) {
			const match = data.allMatches.find((m) => m.matchID === bet.matchId);
			if (match) betMatches.push(match);
		}
		return betMatches.sort((a, b) => new Date(b.matchDateTime).getTime() - new Date(a.matchDateTime).getTime());
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/matches">Matches</a></li>
	<li><a href="/logout" on:click|preventDefault={onLogout}>Logout</a></li>
</Navbar>

<main>
	<h1 class="title">Wettzentrale von <span>{data.user.username}</span></h1>
	<ul class="stats">
		<li class="matchCount">
			<p>Anzahl Wetten</p>
			<p>{data.user.bets.length}</p>
		</li>
		<li class="winRatio">
			<p>Gewinnrate</p>
			<p>
				{Math.round(getWinRatio() * 100)}%
			</p>
		</li>
		<li class="ranking">
			<p>Platzierung</p>
			<p>#{1}</p>
		</li>
	</ul>
	{#if nonBetMatches.length !== 0}
		<div class="statBox">
			<h2>Heute schon gewettet?</h2>
			<ul class="matches">
				{#each nonBetMatches as match}
					<a href="/match/{match.matchID}?from=dashboard">
						<MatchItem {match} user={data.user} />
					</a>
				{/each}
			</ul>
			<a href="/matches">Alle Matches anzeigen</a>
		</div>
	{/if}
	<div class="statBox" id="history">
		<h2>Wettverlauf</h2>
		{#if historyMatches.length === 0}
			<p>Du hast noch keine Wette abgeschlossen...</p>
		{:else}
			<ul class="matches">
				{#each historyMatches as match}
					<a href="/match/{match.matchID}?from=dashboard">
						<MatchItem {match} user={data.user} showInfo={false} />
					</a>
				{/each}
			</ul>
		{/if}
	</div>
</main>

<style>
	main {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.title {
		margin-top: 20px;
		font-size: 3em;
	}
	.title > span {
		color: var(--primary);
	}

	.stats > li > p:first-child {
		font-weight: 500;
		font-size: 1.4rem;
		text-shadow: 0 0 5px #0005;
	}

	.stats > li > p:last-child {
		font-weight: 900;
		font-size: 4rem;
		text-shadow: 0 0 50px #0005;
	}

	.stats {
		display: flex;
		margin: 40px 0;
		gap: clamp(20px, 5vw, 200px);
		color: white;
	}

	.stats > li {
		padding: 20px clamp(10px, 1vw, 40px);
		border-radius: 20px;
		min-width: 300px;
	}

	.matchCount {
		background-image: linear-gradient(315deg, #c70c2b 0%, #f3213d 74%);
	}

	.winRatio {
		background-image: linear-gradient(315deg, #d49c01 0%, #e0ad05 74%);
	}

	.ranking {
		background-image: linear-gradient(315deg, #298d35 0%, #2f9e44 74%);
	}

	.statBox {
		margin-bottom: 40px;
		background-color: #646464;
		border-radius: 20px;
		padding: 10px 20px 20px 20px;
		width: calc(100vw - 80px);
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	#history {
		max-width: 600px;
	}

	.statBox > h2 {
		font-size: 1.7em;
		font-weight: bold;
	}

	.statBox:last-child {
		margin-bottom: 20px;
	}

	.statBox > p {
		font-style: italic;
		font-size: 1em;
		color: white;
	}

	.matches {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 5px;
	}

	.statBox > a {
		color: var(--success);
		background-color: white;
		transition: all 0.33s;
		text-decoration: none;
		font-size: larger;
		font-weight: bold;
		padding: 10px clamp(20px, 5vw, 75px);
		max-width: 500px;
		border-radius: 50px;
		text-align: center;
	}

	.statBox > a:hover {
		color: white;
		background-color: var(--success);
	}

	@media (max-width: 1200px) {
		.title {
			font-size: clamp(1.5rem, 6vw, 3rem);
		}

		.stats {
			flex-direction: column;
			margin-left: clamp(10px, 5vw, 30px);
			margin-right: clamp(10px, 5vw, 30px);
			width: calc(100% - clamp(20px, 10vw, 60px));
			max-width: 750px;
			gap: 5px;
		}
		.stats > li {
			min-width: calc(100% - 20px);
			padding: 10px;
		}

		.stats > li > p:last-child {
			font-size: 3rem;
		}
	}
</style>
