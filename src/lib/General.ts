import { goto, invalidateAll } from '$app/navigation';
import type { Match } from './server/OpenLiga';

export function getBackLink() {
	const from = new URLSearchParams(location.search).get('from');
	if (from) return `/${from}`;
	return '/';
}

export async function onLogout() {
	const response = await fetch('/api/user/logout', {
		method: 'POST'
	});

	if (response.ok) {
		await invalidateAll();
	}

	goto('/matches');
}

export async function onAccountDelete() {
	const response = await fetch('/api/user/delete', {
		method: 'POST'
	});

	if (response.ok) {
		await invalidateAll();
	}

	goto('/matches');
}

export function isMatchWinner(match: Match | undefined, teamId: number) {
	if (!match) return false;
	if (new Date(match.matchDateTimeUTC).getTime() > new Date().getTime()) return false;

	const endResult = match.matchResults.find((m) => m.resultName.includes('Endergebnis'));

	if (endResult && endResult.pointsTeam1 !== undefined && endResult.pointsTeam2 !== undefined) {
		if (endResult.pointsTeam1 > endResult.pointsTeam2) return match.team1.teamId == teamId;
		if (endResult.pointsTeam1 < endResult.pointsTeam2) return match.team2.teamId == teamId;
		return true; // draw - both teams are winners
	}

	const latestResult = match.matchResults[match.matchResults.length - 1];
	if (latestResult && latestResult.pointsTeam1 !== undefined && latestResult.pointsTeam2 !== undefined) {
		if (latestResult.pointsTeam1 > latestResult.pointsTeam2) return match.team1.teamId == teamId;
		if (latestResult.pointsTeam1 < latestResult.pointsTeam2) return match.team2.teamId == teamId;
		return true; // draw - both teams are winners
	}
	return false; // match is not finished
}

export function getResponse(type: 'success' | 'error', message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
