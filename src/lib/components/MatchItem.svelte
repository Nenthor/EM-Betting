<script lang="ts">
	import { getLastMatchResult } from '$lib/General';
	import type { User } from '$lib/server/Database';
	import type { Match, Team } from '$lib/server/OpenLiga';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let match: Match;
	export let user: User;
	export let showInfo = true;

	const contextUser = getContext<Writable<User> | undefined>('user');
	$: user = $contextUser ? $contextUser : user;

	function hasBetForTeam(user: User, team: Team, match: Match) {
		const bet = user.bets.find((bet) => bet.matchId === match.matchID);
		return bet && bet.teamId === team.teamId;
	}

	function getDateFormatted(date: string) {
		const dateObj = new Date(date);
		return dateObj.toLocaleDateString('de-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
	}

	function getMatchInfo(match: Match) {
		let info = '';
		if (match.matchDateTimeUTC) info += `${getDateFormatted(match.matchDateTimeUTC)}`;
		if (match.location && match.location.locationCity) info += ` - ${match.location.locationCity}`;
		if (match.location && match.location.locationStadium) info += ` - ${match.location.locationStadium}`;
		return info;
	}

	function getMatchResult(match: Match) {
		let result = '';
		const lastResult = getLastMatchResult(match);
		if (isRunning(match)) {
			if (lastResult && match.matchResults && match.matchResults.length > 0) {
				result = `${lastResult.pointsTeam1}:${lastResult.pointsTeam2}`;
			} else {
				result = '0:0';
			}
		} else if (match.matchIsFinished && match.matchResults && match.matchResults.length > 0) {
			if (!lastResult) return 'vs';

			result = `${lastResult.pointsTeam1}:${lastResult.pointsTeam2}`;

			if (!match.group.groupName.includes('Gruppe')) {
				// Group matches don't have extra time or penalties
				const extraTimeResult = match.matchResults.find((result) => result.resultName.includes('Verlängerung'));
				const penaltyResult = match.matchResults.find((result) => result.resultName.includes('Elfmeterschießen'));
				if (penaltyResult && penaltyResult.pointsTeam1 !== undefined && penaltyResult.pointsTeam2 !== undefined) {
					result += ' (n.E.)';
				} else if (extraTimeResult && extraTimeResult.pointsTeam1 !== undefined && extraTimeResult.pointsTeam2 !== undefined) {
					result += ' (n.V.)';
				}
			}
		} else {
			result = 'vs';
		}
		return result;
	}

	function getMatchStatus(match: Match, team: Team) {
		const result = getLastMatchResult(match);
		let status = '';

		if (isRunning(match)) status = 'draw';
		if (result && result.pointsTeam1 != null && result.pointsTeam2 != null) {
			if (result.pointsTeam1 > result.pointsTeam2) {
				status = team.teamId === match.team1.teamId ? 'winning' : 'losing';
			} else if (result.pointsTeam1 < result.pointsTeam2) {
				status = team.teamId === match.team1.teamId ? 'losing' : 'winning';
			} else {
				status = 'draw';
			}
		}
		return status;
	}

	function isRunning(match: Match) {
		return !match.matchIsFinished && new Date(match.matchDateTimeUTC).getTime() < Date.now();
	}

	function getTeamName(team: Team) {
		if (team.teamName.includes('TBD')) {
			return 'noch offen';
		}
		return team.teamName;
	}

	function safeUrl(url: string) {
		return url.replace('http://', 'https://');
	}
</script>

<div class="match {isRunning(match) ? 'running' : ''}">
	<div>
		<div class="matchBox">
			<div class="team">
				<img class="matchImage {getMatchStatus(match, match.team1)}" src={safeUrl(match.team1.teamIconUrl)} alt="Flagge von {match.team1.shortName}" />
				<p class="matchTeams">
					{#if hasBetForTeam(user, match.team1, match)}
						<img src="/images/svg/star.svg" alt="selected" />
					{/if}
					{getTeamName(match.team1)}
				</p>
			</div>
			<p class="matchResult">{getMatchResult(match)}</p>
			<div class="team">
				<p class="matchTeams">
					{getTeamName(match.team2)}
					{#if hasBetForTeam(user, match.team2, match)}
						<img src="/images/svg/star.svg" alt="selected" />
					{/if}
				</p>
				<img class="matchImage {getMatchStatus(match, match.team2)}" src={safeUrl(match.team2.teamIconUrl)} alt="Flagge von {match.team2.shortName}" />
			</div>
		</div>
		{#if showInfo}
			<div class="matchBox">
				<p class="matchInfo">
					{getMatchInfo(match)}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.match {
		padding: 0;
		overflow: hidden;
		padding: 5px;
		border-radius: 20px;
		font-weight: normal;
		font-size: 1rem;
		width: 550px;
	}

	@keyframes rotate {
		from {
			transform: translate(-50%, -50%) scale(1.4) rotate(0turn);
		}
		to {
			transform: translate(-50%, -50%) scale(1.4) rotate(1turn);
		}
	}

	.running {
		position: relative;
	}

	.running::after {
		content: '';
		position: absolute;
		aspect-ratio: 1/1;
		width: 100%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-image: conic-gradient(transparent 270deg, #3c3, #3c3, transparent);
		animation: rotate 4s linear infinite;
		z-index: -1;
		opacity: 1;
	}

	.match > div {
		border-radius: 10px;
		background-color: #fff;
		padding: 10px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5px;
		height: calc(100% - 20px);
		border-radius: 20px;
	}

	.matchBox {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.matchBox:first-child {
		width: 100%;
	}

	.matchImage {
		width: 30px;
		background-color: white;
		padding: 3px;
	}

	.matchImage.winning {
		border: 5px solid var(--success);
		border-radius: 20%;
	}

	.matchImage.losing {
		border: 5px solid var(--error);
		border-radius: 20%;
	}

	.matchImage.draw {
		border: 5px solid #ff9b00;
		border-radius: 20%;
	}

	.team > p {
		color: black;
		margin: 0 15px;
		text-align: center;
	}

	.matchTeams {
		display: flex;
		justify-content: center;
		font-size: large;
		font-weight: bold;
		flex-grow: 1;
		flex-basis: 100px;
		gap: 10px;
	}

	.team {
		display: flex;
		align-items: center;
		flex-direction: row;
		width: 100%;
	}

	.matchTeams > img {
		width: 20px;
	}

	.matchResult {
		font-size: large;
		font-weight: bold;
		color: black;
	}

	.matchInfo {
		color: black;
		text-align: center;
	}

	.running {
		animation: ongoing 1s infinite;
		position: relative;
		z-index: 2;
	}

	@media (max-width: 1300px) {
		.match {
			width: 300px;
		}

		.matchBox {
			flex-direction: column;
		}

		.matchTeams {
			flex-grow: 0;
			flex-basis: 0;
			flex-direction: row-reverse;
		}

		.team {
			justify-content: center;
		}

		.team:last-child {
			flex-direction: row-reverse;
		}

		.matchInfo {
			font-size: small;
		}
	}

	@media (max-width: 400px) {
		.match {
			width: 222px;
		}
	}
</style>
