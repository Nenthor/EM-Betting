import { getMatchWinner } from '$lib/General';
import { getAllUsers, type User } from './Database';
import type { Match, Stage } from './OpenLiga';
import { fetchAvailableGroups, fetchCurrentGroup, fetchMatchData } from './OpenLiga';

export const CACHE_TIME = 30_000; // in seconds

let allUsers: User[] = [];

let stages: Stage[] = [];
let currentStage: Stage | null = null;
let allMatches: Match[] = [];
let allMatchesIndices = new Map<number, number>(); // k: matchId; v: index in allMatches
let matchesInGroup: { groupName: string; matches: Match[] }[] = [];
let matchesInKnockout: { stageName: string; matches: Match[] }[] = [];

let lastRefresh = Date.now();
let refreshDone = firstLoad();

export const defaultUser: User = {
	username: '',
	password: '',
	photoURL: '',
	bets: []
};

export interface Ranking {
	rank: number;
	user: User;
	correctBets: number;
	totalBets: number;
}

export async function update(force = false) {
	if (force || Date.now() - lastRefresh > CACHE_TIME) {
		// Cache time is over - refresh data
		lastRefresh = Date.now();
		refreshDone = refreshData();
	}
	await refreshDone;
}

async function refreshData() {
	const promises = [];
	let newMatchData: Match[] = [];
	promises.push(fetchMatchData(currentStage!.groupOrderID).then((data) => (newMatchData = data)));
	promises.push(getAllUsers().then((data) => (allUsers = data)));
	await Promise.all(promises);

	for (const newMatch of newMatchData) {
		const oldMatchIndex = allMatchesIndices.get(newMatch.matchID);
		if (oldMatchIndex) allMatches[oldMatchIndex] = newMatch;
	}

	if (currentStage!.groupName.includes('Gruppe')) {
		for (const group of matchesInGroup) {
			for (const matchIndex in group.matches) {
				const newMatch = newMatchData.find((match) => match.matchID == group.matches[matchIndex].matchID);
				if (newMatch) group.matches[matchIndex] = newMatch;
			}
		}
	} else {
		const stageIndex = matchesInKnockout.findIndex((stage) => stage.stageName == currentStage!.groupName);
		if (stageIndex == -1) return;
		for (const matchIndex in matchesInKnockout[stageIndex].matches) {
			const newMatch = newMatchData.find((match) => match.matchID == matchesInKnockout[stageIndex].matches[matchIndex].matchID);
			if (newMatch) matchesInKnockout[stageIndex].matches[matchIndex] = newMatch;
		}
	}
}

export function getAvailableStages() {
	return stages;
}

export function getMatch(matchId: any) {
	return allMatches.find((match) => match.matchID == matchId);
}

export function getAllMatches() {
	return allMatches;
}

export function getGroupStageMatches() {
	return matchesInGroup;
}

export function getKnockoutStageMatches() {
	return matchesInKnockout;
}

export function getCurrentStage() {
	return currentStage;
}

async function firstLoad() {
	const promises = [];
	promises.push(fetchAvailableGroups().then((data) => (stages = data)));
	promises.push(fetchCurrentGroup().then((data) => (currentStage = data)));
	promises.push(fetchMatchData().then((data) => (allMatches = data)));
	promises.push(getAllUsers().then((data) => (allUsers = data)));
	await Promise.all(promises);

	for (let i = 0; i < allMatches.length; i++) {
		allMatchesIndices.set(allMatches[i].matchID, i);
	}

	matchesInGroup = getMatchesInGroups();
	matchesInKnockout = getMatchesInKnockout();

	lastRefresh = Date.now();
}

function getMatchesInKnockout(): { stageName: string; matches: Match[] }[] {
	const matchesInKnockout: { stageName: string; matches: Match[] }[] = [];
	const stageIndices = new Map<string, number>(); // k: stageName; v: index in matchesInKnockout

	for (const stage of stages) {
		if (stage.groupName.includes('Gruppe')) continue;
		matchesInKnockout.push({ stageName: stage.groupName, matches: [] });
		stageIndices.set(stage.groupName, matchesInKnockout.length - 1);
	}

	for (const match of allMatches) {
		if (match.group.groupName.includes('Gruppe')) continue;
		const stageIndex = stageIndices.get(match.group.groupName);
		if (stageIndex == undefined) continue;
		matchesInKnockout[stageIndex].matches.push(match);
	}

	return matchesInKnockout;
}

function getMatchesInGroups(): { groupName: string; matches: Match[] }[] {
	// Filter teams that are in one group (A, B, C, D, E, F, ...)
	const groupStageMatches = allMatches.filter((match) => match.group.groupName.includes('Gruppe'));
	const matchesInGroup: { groupName: string; matches: Match[] }[] = [];
	const teams = new Map<number, number>(); // k: teamId; v: matchesInGroup index
	let currentTeam = 0;

	for (const match of groupStageMatches) {
		if (teams.has(match.team1.teamId) || teams.has(match.team2.teamId)) {
			const groupIndex = teams.get(match.team1.teamId) ?? teams.get(match.team2.teamId)!;
			teams.set(match.team1.teamId, groupIndex);
			teams.set(match.team2.teamId, groupIndex);
			matchesInGroup[groupIndex].matches.push(match);
			continue;
		}

		const teamId = match.team1.teamId;
		const teamMatches = groupStageMatches.filter((match) => match.team1.teamId == teamId || match.team2.teamId == teamId);
		const opponentIds = teamMatches.map((match) => (match.team1.teamId == teamId ? match.team2.teamId : match.team1.teamId));

		let hasGroup = false;
		for (const opponentId of opponentIds) {
			if (teams.has(opponentId)) {
				const groupIndex = teams.get(opponentId)!;
				teams.set(teamId, groupIndex);
				matchesInGroup[groupIndex].matches.push(match);
				hasGroup = true;
				break;
			}
		}

		if (!hasGroup) {
			teams.set(teamId, currentTeam);
			teams.set(match.team2.teamId, currentTeam);
			matchesInGroup.push({ groupName: `Gruppe ${String.fromCharCode(65 + currentTeam)}`, matches: [match] });
			currentTeam++;
		}
	}

	return matchesInGroup;
}

export function getUserRanking() {
	const ranking: Ranking[] = allUsers.map((user) => {
		const correctBets = user.bets.filter((bet) => getMatchWinner(getMatch(bet.matchId)) == bet.teamId).length;
		const totalBets = user.bets.length;
		return { rank: 0, user, correctBets, totalBets };
	});

	// Sort users: 1. Correct bets, 2. Total bets, 3. Alphabetically and set rank accordingly Alphabetically has same rank
	ranking.sort((a, b) => {
		if (a.correctBets != b.correctBets) return b.correctBets - a.correctBets;
		if (a.totalBets != b.totalBets) return b.totalBets - a.totalBets;
		return a.user.username.localeCompare(b.user.username);
	});

	let currentRank = 1;
	ranking[0].rank = currentRank;
	for (let i = 1; i < ranking.length; i++) {
		currentRank++;
		if (ranking[i].correctBets === ranking[i - 1].correctBets && ranking[i].totalBets === ranking[i - 1].totalBets) {
			ranking[i].rank = ranking[i - 1].rank;
		} else {
			ranking[i].rank = currentRank;
		}
	}
	return ranking;
}