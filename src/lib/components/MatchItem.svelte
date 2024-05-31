<script lang="ts">
	import type { User } from '$lib/server/Database';
	import type { Match, Team } from '$lib/server/OpenLiga';

	export let match: Match;
	export let user: User;
	export let showInfo = true;

	function hasBetForTeam(team: Team) {
		const bet = user.bets.find((bet) => bet.matchId === match.matchID);
		return bet && bet.teamId === team.teamId;
	}

	function getDateFormatted(date: string) {
		const dateObj = new Date(date);
		return dateObj.toLocaleDateString('de-DE', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
	}

	function getMatchInfo() {
		let info = '';
		if (match.matchDateTime) info += `${getDateFormatted(match.matchDateTime)}`;
		if (match.location && match.location.locationCity) info += ` - ${match.location.locationCity}`;
		if (match.location && match.location.locationStadium) info += ` - ${match.location.locationStadium}`;
		return info;
	}

	function getMatchResult() {
		let result = '';
		if (isRunning()) {
			if (match.matchResults && match.matchResults.length > 0) {
				const lastResult = match.matchResults[match.matchResults.length - 1];
				result = `${lastResult.pointsTeam1}:${lastResult.pointsTeam2}`;
			} else {
				result = ':';
			}
		} else if (match.matchIsFinished) {
			const lastResult = match.matchResults.find((result) => result.resultName.includes('Endergebnis'))!;
			result = `${lastResult.pointsTeam1}:${lastResult.pointsTeam2}`;

			const extraTimeResult = match.matchResults.find((result) => result.resultName.includes('Verlängerung'));
			const penaltyResult = match.matchResults.find((result) => result.resultName.includes('Elfmeterschießen'));
			if (penaltyResult && penaltyResult.pointsTeam1 && penaltyResult.pointsTeam2) {
				result += ' (n.E.)';
			} else if (extraTimeResult && extraTimeResult.pointsTeam1 && extraTimeResult.pointsTeam2) {
				result += ' (n.V.)';
			}
		} else {
			result = 'vs';
		}
		return result;
	}

	function getMatchStatus(team: Team) {
		const result = match.matchResults.find((result) => result.resultName.includes('Endergebnis'))!;
		let status = '';
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

	function isRunning() {
		return !match.matchIsFinished && new Date(match.matchDateTime).getTime() < Date.now();
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

<div class="match {isRunning() ? 'running' : ''}">
	<div>
		<div class="matchBox">
			<div class="team">
				<img class="matchImage {getMatchStatus(match.team1)}" src={safeUrl(match.team1.teamIconUrl)} alt="Flagge von {match.team1.shortName}" />
				<p class="matchTeams">
					{#if hasBetForTeam(match.team1)}
						<img src="/images/svg/star.svg" alt="selected" />
					{/if}
					{getTeamName(match.team1)}
				</p>
			</div>
			<p class="matchResult">{getMatchResult()}</p>
			<div class="team">
				<p class="matchTeams">
					{getTeamName(match.team2)}
					{#if hasBetForTeam(match.team2)}
						<img src="/images/svg/star.svg" alt="selected" />
					{/if}
				</p>
				<img class="matchImage {getMatchStatus(match.team2)}" src={safeUrl(match.team2.teamIconUrl)} alt="Flagge von {match.team2.shortName}" />
			</div>
		</div>
		{#if showInfo}
			<div class="matchBox">
				<p class="matchInfo">
					{getMatchInfo()}
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
			transform: rotate(0);
		}
		to {
			transform: rotate(1turn);
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
		top: -225%;
		left: 0%;
		background-repeat: no-repeat;
		background-size:
			50% 50%,
			50% 50%;
		background-position:
			0 0,
			100% 0,
			100% 100%,
			0 100%;
		background-image: radial-gradient(#4f4, #3c3, #292, transparent), linear-gradient(transparent, transparent), linear-gradient(transparent, transparent), linear-gradient(transparent, transparent);
		animation: rotate 5s linear infinite;
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
