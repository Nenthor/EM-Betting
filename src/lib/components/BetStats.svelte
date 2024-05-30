<script lang="ts">
	import type { Bet, User } from '$lib/server/Database';
	import type { Match, Team } from '$lib/server/OpenLiga';

	export let data: {
		match: Match;
		isAuthenticated: boolean;
		user: User;
		isGroupStageMatch: boolean;
		matchBets: Bet[];
	};

	function getBetTeam(Bet: Bet) {
		return data.match.team1.teamId == Bet.teamId ? data.match.team1.teamName : data.match.team2.teamName;
	}

	function getBetTeamAmount(team: Team) {
		return data.matchBets.filter((bet) => bet.teamId === team.teamId).length;
	}
</script>

<div class="box">
	<h2>Wetten von anderen</h2>
	{#if data.matchBets.length === 0}
		<p><i>Es wurden {new Date(data.match.matchDateTime).getTime() > Date.now() ? 'noch' : ''} keine Wetten abgegeben...</i></p>
	{:else}
		<p><b>{getBetTeamAmount(data.match.team1)}x</b> für {data.match.team1.teamName} - <b>{getBetTeamAmount(data.match.team2)}x</b> für {data.match.team2.teamName}</p>
		<ul>
			{#each data.matchBets as bet}
				<li>{bet.createdBy} für {getBetTeam(bet)}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px 20px;
		margin: 0 20px;
		gap: 10px;
		background-color: #646464;
		border-radius: 20px;
		max-width: 350px;
	}

	h2,
	p {
		text-align: center;
	}

	ul {
		list-style-type: none;
		padding: 0;
		max-height: 200px;
		overflow-y: auto;
	}

	ul > li {
		padding: 5px 20px;
		margin: 3px 0;
		border-radius: 5px;
		text-align: center;
		background-color: #fff;
	}
</style>
