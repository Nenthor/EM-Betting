<script lang="ts">
	import { onAccountDelete, onLogout } from '$lib/General';
	import Footer from '$lib/components/Footer.svelte';
	import MatchItem from '$lib/components/MatchItem.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import NumberAnimation from '$lib/components/NumberAnimation.svelte';
	import type { Match } from '$lib/server/OpenLiga';
	import type { PageData } from './$types';

	export let data: PageData;

	const MAX_SELECTED_MATCHES = 5;

	let nonBetMatches: Match[] = [];
	let historyMatches: Match[] = [];
	let todaysMatches: Match[] = [];

	$: nonBetMatches = getNonBetMatches(data);
	$: historyMatches = getHistoryMatches(data);
	$: todaysMatches = getTodaysMatches(data);

	function getNonBetMatches(data: PageData) {
		const select: Match[] = [];

		for (const match of data.allMatches) {
			if (select.length >= MAX_SELECTED_MATCHES) break;
			if (!match.matchDateTime || new Date(match.matchDateTime) < new Date()) continue;
			if (match.team1.teamName.includes('noch offen') || match.team2.teamName.includes('noch offen')) continue;
			if (!data.user.bets.some((bet) => bet.matchId === match.matchID)) {
				select.push(match);
			}
		}

		return select.sort((a, b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime());
	}

	function getHistoryMatches(data: PageData) {
		const betMatches: Match[] = [];
		for (const bet of data.user.bets) {
			const match = data.allMatches.find((m) => m.matchID === bet.matchId);
			if (match) betMatches.push(match);
		}
		return betMatches.sort((a, b) => new Date(b.matchDateTime).getTime() - new Date(a.matchDateTime).getTime());
	}

	function getTodaysMatches(data: PageData) {
		const matches = data.allMatches.filter((match) => {
			const date = new Date(match.matchDateTime);
			const today = new Date();
			return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
		});
		return matches.sort((a, b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime()).slice(0, MAX_SELECTED_MATCHES);
	}

	function onDeleteConfirm() {
		if (confirm('Bist du sicher, dass du deinen Account für IMMER löschen möchtest?')) {
			onAccountDelete();
		}
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/matches">Matches</a></li>
	<li><a href="/ranking">Rangliste</a></li>
</Navbar>

<main>
	<h1 class="title">Wettzentrale von <span>{data.user.username}</span></h1>
	<ul class="stats">
		<li>
			<p>Anzahl Wetten</p>
			<p><NumberAnimation value={data.ranking.totalBets} /></p>
		</li>
		<li>
			<p>Platzierung</p>
			<p>#<NumberAnimation value={data.ranking.rank} startValue={data.maxRank} /></p>
		</li>
		<li>
			<p>Richtige Wetten</p>
			<p><NumberAnimation value={data.ranking.correctBets} /></p>
		</li>
	</ul>
	{#if nonBetMatches.length !== 0}
		<div class="statBox">
			<h2>Heute schon gewettet?</h2>
			<ul class="matches">
				{#each nonBetMatches as match}
					<li>
						<a href="/match/{match.matchID}">
							<MatchItem {match} user={data.user} />
						</a>
					</li>
				{/each}
			</ul>
			<a href="/matches">Mehr anzeigen</a>
		</div>
	{:else if todaysMatches.length !== 0}
		<div class="statBox">
			<h2>Heutige Spiele</h2>
			<ul class="matches">
				{#each todaysMatches as match}
					<li>
						<a href="/match/{match.matchID}">
							<MatchItem {match} user={data.user} />
						</a>
					</li>
				{/each}
			</ul>
			<a href="/matches">Mehr anzeigen</a>
		</div>
	{/if}
	<div class="statBox" id="history">
		<h2>Wettverlauf</h2>
		{#if historyMatches.length === 0}
			<p>Du hast noch keine Wette abgeschlossen...</p>
		{:else}
			<ul class="matches">
				{#each historyMatches as match}
					<li>
						<a href="/match/{match.matchID}">
							<MatchItem {match} user={data.user} showInfo={false} />
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="account">
		<h2>Account</h2>
		<p>Benutzername: <span>{data.user.username}</span></p>
		<a class="success" href="/logout" on:click|preventDefault={onLogout}>Abmelden</a>
		<a class="danger" href="/delete" on:click|preventDefault={onDeleteConfirm}>Account löschen</a>
	</div>
</main>
<Footer />

<style>
	main {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.title {
		margin: 20px 10px 0 10px;
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
		max-width: 1240px;
		width: calc(100vw - 40px);
		justify-content: space-between;
		color: white;
	}

	.stats > li {
		padding: 20px clamp(10px, 1vw, 40px);
		border-radius: 20px;
		min-width: 300px;
	}

	.stats > li:nth-child(1) {
		background-image: linear-gradient(315deg, #c70c2b 0%, #f3213d 74%);
	}

	.stats > li:nth-child(2) {
		background-image: linear-gradient(315deg, #d49c01 0%, #e0ad05 74%);
	}

	.stats > li:nth-child(3) {
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

	#history > ul {
		max-height: 500px;
		overflow-y: auto;
		overflow-x: hidden;
		border-radius: 50px;
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
		color: var(--success-dark);
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
		background-color: var(--success-dark);
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

	.account {
		background-color: #646464;
		border-radius: 20px;
		padding: 10px 20px 20px 20px;
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
		margin: 0 15px 20px 15px;
	}

	.account > h2 {
		font-size: 1.7em;
		font-weight: bold;
	}

	.account > p {
		text-align: center;
		font-size: 1.1rem;
	}

	.account > p > span {
		color: var(--primary-light);
		font-weight: 600;
	}

	.account > a {
		text-decoration: none;
		background-color: white;
		color: black;
		padding: 10px 20px;
		border-radius: 50px;
		transition: all 0.33s;
		font-weight: bold;
		min-width: 150px;
	}

	.success {
		color: var(--success-dark) !important;
		margin-bottom: 10px;
	}

	.success:hover {
		background-color: var(--success-dark) !important;
		color: white !important;
		margin-bottom: 10px;
	}

	.danger {
		color: white !important;
		background-color: var(--error) !important;
	}

	.danger:hover {
		background-color: var(--error-dark) !important;
	}
</style>
