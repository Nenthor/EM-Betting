import { invalidateAll } from '$app/navigation';
import type { Match } from './server/OpenLiga';

export function getBackLink() {
	const from = new URLSearchParams(location.search).get('from');
	if (from) return `/${from}`;
	return '/';
}

export async function onLogout() {
	const response = await fetch('/api/logout', {
		method: 'POST'
	});

	if (response.ok) {
		await invalidateAll();
	}
}

export function getMatchWinner(match: Match | undefined) {
	if (!match) return 0;

	const endResult = match.matchResults.find((m) => m.resultName.includes('Endergebnis'));

	if (endResult) {
		if (endResult.pointsTeam1 > endResult.pointsTeam2) return match.team1.teamId;
		if (endResult.pointsTeam1 < endResult.pointsTeam2) return match.team2.teamId;
		return 0;
	}

	const latestResult = match.matchResults[match.matchResults.length - 1];
	if (latestResult) {
		if (latestResult.pointsTeam1 > latestResult.pointsTeam2) return match.team1.teamId;
		if (latestResult.pointsTeam1 < latestResult.pointsTeam2) return match.team2.teamId;
	}
	return 0;
}
