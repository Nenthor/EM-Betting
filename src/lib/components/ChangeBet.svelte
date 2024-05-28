<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Match, Team } from '$lib/OpenLiga';
	import type { User } from '$lib/server/Database';

	export let data: {
		match: Match;
		isAuthenticated: boolean;
		user: User;
		isGroupStageMatch: boolean;
	};

	let selectedTeam = getSelectedTeam();
	let fetching = false;

	function getSelectedTeam() {
		const bet = data.user.bets.find((bet) => bet.matchId === data.match.matchID);
		return bet && bet.teamId === data.match.team1.teamId ? data.match.team1 : data.match.team2;
	}

	function getUnselectedTeam(selectedTeam: Team) {
		return selectedTeam === data.match.team1 ? data.match.team2 : data.match.team1;
	}

	async function submitBet() {
		if (fetching) return;
		fetching = true;

		const response = await fetch('/api/bet/set', {
			method: 'POST',
			headers: {
				matchId: data.match.matchID.toString(),
				teamId: getUnselectedTeam(selectedTeam).teamId.toString()
			}
		});

		if (!response.ok) {
			console.error('Failed to submit bet');
		}

		const json = await response.json();
		if (json.type === 'success') {
			selectedTeam = getUnselectedTeam(selectedTeam);
			data.user.bets.find((bet) => bet.matchId === data.match.matchID)!.teamId = selectedTeam.teamId;
		}
		fetching = false;
	}

	async function deleteBet() {
		if (fetching) return;
		fetching = true;
		const response = await fetch('/api/bet/delete', {
			method: 'POST',
			headers: {
				matchId: data.match.matchID.toString()
			}
		});

		if (!response.ok) {
			console.error('Failed to submit bet');
		}

		const json = await response.json();
		if (json.type === 'success') {
			data.user.bets = data.user.bets.filter((bet) => bet.matchId !== data.match.matchID);
			selectedTeam = data.match.team1;
			await invalidateAll();
		}
		fetching = false;
	}
</script>

<div class="box">
	<h2>Wette ändern</h2>
	<form>
		<div class="team">
			<p>Eine Wette für <span>{selectedTeam.teamName}</span> wurde bereits eingereicht.</p>
		</div>
		<button on:click|preventDefault={submitBet} id="submit">Für {getUnselectedTeam(selectedTeam).teamName} wetten</button>
		<button on:click|preventDefault={deleteBet} id="delete">Wette löschen</button>
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
		padding: 10px 20px;
		margin: 50px 20px 0 20px;
		gap: 10px;
		background-color: #646464;
		border-radius: 20px;
		max-width: 350px;
	}

	button {
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

	#delete {
		margin-top: 10px;
		color: white;
		background-color: var(--error);
		transition: all 0.33s;
	}

	#delete:hover {
		background-color: var(--error-dark);
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

	.team > p > span {
		font-weight: bold;
		color: var(--primary-light);
		font-size: larger;
		text-shadow: 0 0 10px var(--primary-dark);
	}

	.groupStageInfo {
		color: white;
		text-align: center;
		text-wrap: wrap;
		font-style: italic;
	}
</style>
