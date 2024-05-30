<script lang="ts">
	import { getBackLink } from '$lib/General';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let userRankIndex = data.ranking.findIndex((r) => r.user.username === data.user.username);

	let backLink = '/';
	onMount(() => {
		backLink = getBackLink();
	});

	function getStartIndex() {
		if (userRankIndex == -1 || data.ranking[userRankIndex - 1].rank <= 10) return userRankIndex;
		else return userRankIndex - 1;
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href={backLink}>Zurück</a></li>
</Navbar>

<main>
	<h1>Rangliste</h1>
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
					{#each data.ranking.slice(getStartIndex(), userRankIndex + 2) as ranking}
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
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		color: var(--primary-light);
		margin: 20px 0 40px 0;
		font-size: clamp(2rem, 10vw, 4rem);
		text-align: center;
	}

	main > div {
		margin: 0 10px;
		max-width: calc(100vw - 20px);
		overflow-x: auto;
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
		background-color: #777;
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
</style>
