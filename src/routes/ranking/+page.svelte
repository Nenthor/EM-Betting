<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import NumberAnimation from '$lib/components/NumberAnimation.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let userRankIndex = data.ranking.findIndex((r) => r.user.username === data.user.username);

	function getStartIndex(data: PageData) {
		if (userRankIndex == -1 || data.ranking[userRankIndex - 1].rank <= 10) return userRankIndex;
		else return userRankIndex - 1;
	}

	function getTotalAmmountOfBets(data: PageData) {
		return data.ranking.reduce((acc, r) => acc + r.totalBets, 0);
	}

	function getBetsPerUser(data: PageData) {
		if (data.ranking.length == 0) return 0;
		return getTotalAmmountOfBets(data) / data.ranking.length;
	}
</script>

<Navbar addHomeLink={false}>
	<li>
		<a href="/back" on:click|preventDefault={() => history.back()}>Zurück</a>
	</li>
</Navbar>

<main>
	<h1>Rangliste</h1>
	<div>
		<div>
			<table>
				<thead>
					<tr>
						<th>Platz</th>
						<th>Name</th>
						<th>Richtige Wetten</th>
						<th>Anzahl Wetten</th>
					</tr>
				</thead>
				<tbody>
					{#each data.ranking.filter((r) => r.rank <= 10) as ranking}
						<tr class={ranking.user.username == data.user.username ? 'myRank' : ''}>
							<td class={ranking.rank <= 3 ? `rank rank${ranking.rank}` : ''}><p>#{ranking.rank}</p></td>
							<td>{ranking.user.username}</td>
							<td>{ranking.correctBets}</td>
							<td>{ranking.totalBets}</td>
						</tr>
					{/each}
					{#if userRankIndex != -1 && data.ranking[userRankIndex].rank > 10}
						{#if userRankIndex != -1 && data.ranking[userRankIndex - 2].rank > 10}
							<td class="splitter" colspan="4"><img src="/images/svg/dotdotdot.svg" alt="splitt" /></td>
						{/if}
						{#each data.ranking.slice(getStartIndex(data), userRankIndex + 2) as ranking}
							<tr class={ranking.user.username == data.user.username ? 'myRank' : ''}>
								<td><p>#{ranking.rank}</p></td>
								<td>{ranking.user.username}</td>
								<td>{ranking.correctBets}</td>
								<td>{ranking.totalBets}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
	<div>
		<div class="generalStats">
			<h2>Allgemeine Statistik</h2>
			<ul>
				<li>
					<p>Registrierte Nutzer</p>
					<p><NumberAnimation value={data.ranking.length} /></p>
				</li>
				<li>
					<p>Anzahl aller Wetten</p>
					<p><NumberAnimation value={getTotalAmmountOfBets(data)} /></p>
				</li>
				<li>
					<p>Wetten pro Nutzer</p>
					<p><NumberAnimation value={getBetsPerUser(data)} roundPosition={2} /></p>
				</li>
			</ul>
		</div>
	</div>
</main>

<Footer />

<style>
	h1 {
		color: var(--primary);
		margin: 20px 0 40px 0;
		font-size: clamp(2rem, 12vw, 4rem);
		text-align: center;
	}

	main > div {
		margin: 0 10px;
		max-width: calc(100vw - 20px);
		overflow-x: auto;
	}

	main > div > div {
		max-width: fit-content;
		margin-left: auto;
		margin-right: auto;
	}

	table {
		color: white;
		text-align: center;
		border-collapse: collapse;
		border: none;
		border-radius: 20px;
		overflow: hidden;
	}

	table td:first-child > p {
		font-weight: bold;
		font-size: 1.1rem;
		text-shadow: 1px 1px 1px black;
	}

	table td,
	table th {
		border: 2px solid white;
		padding: 10px clamp(10px, 5vw, 75px);
	}

	table tr > td:first-child,
	table tr > th:first-child {
		border-left: none;
	}

	table tr > td:last-child,
	table tr > th:last-child {
		border-right: none;
	}

	table tr:last-child > td {
		border-bottom: none;
	}

	table > thead th {
		border-top: none;
		background-color: black;
	}

	table tr:nth-child(odd) {
		background-color: #555;
	}

	table tr:nth-child(even) {
		background-color: #757575;
	}

	.myRank {
		background-color: var(--primary-dark) !important;
	}

	.splitter {
		border: none;
		text-align: center;
		padding: 0;
	}

	.splitter img {
		width: 30px;
	}

	.rank {
		padding: 5px calc(clamp(10px, 5vw, 75px) - 5px);
	}

	.rank > p {
		border-radius: 5px;
		padding: 5px;
	}

	.rank1 > p {
		background-color: #fb0;
	}

	.rank2 > p {
		background-color: #c0c0c0;
	}

	.rank3 > p {
		background-color: #cd7f32;
	}

	.generalStats {
		margin-top: 40px;
		margin-bottom: 20px;
		background-color: #646464;
		padding: 10px 20px 20px 20px;
		border-radius: 20px;
	}

	.generalStats > h2 {
		font-size: 1.7em;
		text-align: center;
		margin: 0 20px 20px 20px;
	}

	.generalStats > ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 25px;
	}

	.generalStats > ul > li {
		border-radius: 20px;
		padding: 10px 20px;
		text-align: center;
	}

	.generalStats > ul > li:nth-child(1) {
		background-image: linear-gradient(315deg, #c70c2b 0%, #f3213d 74%);
	}

	.generalStats > ul > li:nth-child(2) {
		background-image: linear-gradient(315deg, #d49c01 0%, #e0ad05 74%);
	}

	.generalStats > ul > li:nth-child(3) {
		background-image: linear-gradient(315deg, #298d35 0%, #2f9e44 74%);
	}

	.generalStats > ul > li > p:first-child {
		font-weight: 500;
		font-size: 1.2rem;
		text-shadow: 0 0 1.2rem #0005;
	}

	.generalStats > ul > li > p:last-child {
		font-weight: 900;
		font-size: 2rem;
		text-shadow: 0 0 2rem #0005;
	}

	@media (max-width: 800px) {
		.generalStats {
			max-width: 500px;
		}
	}

	@media (max-width: 600px) {
		.generalStats {
			max-width: min-content;
		}

		.generalStats > h2 {
			font-size: 1.5em;
		}

		.generalStats > ul > li > p:first-child {
			font-size: 1rem;
		}

		.generalStats > ul > li > p:last-child {
			font-size: 1.5rem;
		}
	}
</style>
