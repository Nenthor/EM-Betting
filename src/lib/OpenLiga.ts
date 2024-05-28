const LEAGE_SHORTCUT = 'em';
const SEASON = 2024;

export interface GroupMatch {
	[key: number]: Match[];
}

export interface Match {
	matchID: number;
	matchDateTime: string;
	timeZoneID: string;
	leagueId: number;
	leagueName: string;
	leagueSeason: string;
	leagueShortcut: string;
	matchDateTimeUTC: string;
	group: Stage;
	team1: Team;
	team2: Team;
	lastUpdateDateTime: string;
	matchIsFinished: boolean;
	matchResults: MatchResult[];
	goals: Goal[];
	location: Location;
	numberOfViewers: number;
}

export interface Location {
	locationID: number;
	locationCity: string;
	locationStadium: string;
}

export interface Stage {
	groupName: string;
	groupOrderID: number;
	groupID: number;
}

export interface Team {
	teamId: number;
	teamName: string;
	shortName: string;
	teamIconUrl: string;
	teamGroupName: string;
}

export interface MatchResult {
	resultID: number;
	resultName: string;
	pointsTeam1: number;
	pointsTeam2: number;
	resultOrderID: number;
	resultTypeID: number;
	resultDescription: string;
}

export interface Goal {
	goalID: number;
	scoreTeam1: number;
	scoreTeam2: number;
	matchMinute: number;
	goalGetterID: number;
	goalGetterName: string;
	isPenalty: boolean;
	isOwnGoal: boolean;
	isOvertime: boolean;
	comment: string;
}

export interface GoalGetter {
	goalGetterID: number;
	goalGetterName: string;
	goalCount: number;
}

export interface League {
	leagueID: number;
	leagueName: string;
	leagueSport: string;
	leagueShortcut: string;
	leagueSaison: number;
	sport: Sport;
}

export interface Sport {
	sportID: number;
	sportName: string;
}

export interface TableTeam {
	teamInfoId: number;
	teamName: string;
	shortName: string;
	teamIconUrl: string;
	points: number;
	opponentGoals: number;
	goals: number;
	matches: number;
	won: number;
	draw: number;
	lost: number;
	goalDiff: number;
}

async function fetchData(url: string) {
	const response: Response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
}

export async function fetchMatchData(groupOrderID: number | undefined = undefined): Promise<Match[]> {
	let url = `https://api.openligadb.de/getmatchdata/${LEAGE_SHORTCUT}/${SEASON}`;
	if (groupOrderID !== undefined) url += `/${groupOrderID}`;
	return await fetchData(url);
}

export async function fetchCurrentGroup(): Promise<Stage> {
	return await fetchData('https://api.openligadb.de/getcurrentgroup/em');
}

export async function fetchAvailableGroups(): Promise<Stage[]> {
	return await fetchData(`https://api.openligadb.de/getavailablegroups/${LEAGE_SHORTCUT}/${SEASON}`);
}
