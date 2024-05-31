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

export function getResponse(type: 'success' | 'error', message: string) {
	return new Response(JSON.stringify({ type, message }), {
		headers: { 'content-type': 'application/json' }
	});
}
