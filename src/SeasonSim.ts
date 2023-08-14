import { readFileSync } from 'fs';
import { TotalWinLine } from './TotalWinLines';

export interface GameLine {
  team1: string;
  team1OddsAmerican: number;
  team1OddsDecimal: number;
  team1ImpliedProb: number;

  team2: string;
  team2OddsAmerican: number;
  team2OddsDecimal: number;
  team2ImpliedProb: number;

  team1AdjustedProb: number;
  team2AdjustedProb: number;
}

export function parseGameLines(): GameLine[] {
  const content = readFileSync('./res/gameLines.json', 'utf8');
  const root = JSON.parse(content);
  const gameArray =
    root['eventGroup']['offerCategories'][0]['offerSubcategoryDescriptors'][0]['offerSubcategory']['offers'];
  let outputGames: GameLine[] = [];

  gameArray.forEach((game: any) => {
    const outcomes = game[2]['outcomes'];
    const team1 = outcomes[0]['participant'];
    const team1OddsAmerican = parseInt(outcomes[0]['oddsAmerican']);
    const team1OddsDecimal = parseFloat(outcomes[0]['oddsDecimal']);
    const team1ImpliedProb = 1 / team1OddsDecimal;

    const team2 = outcomes[1]['participant'];
    const team2OddsAmerican = parseInt(outcomes[1]['oddsAmerican']);
    const team2OddsDecimal = parseFloat(outcomes[1]['oddsDecimal']);
    const team2ImpliedProb = 1 / team2OddsDecimal;

    const team1AdjustedProb = team1ImpliedProb / (team1ImpliedProb + team2ImpliedProb);
    const team2AdjustedProb = team2ImpliedProb / (team1ImpliedProb + team2ImpliedProb);

    outputGames.push({
      team1,
      team1OddsAmerican,
      team1OddsDecimal,
      team1ImpliedProb,
      team2,
      team2OddsAmerican,
      team2OddsDecimal,
      team2ImpliedProb,
      team1AdjustedProb,
      team2AdjustedProb,
    });
  });

  return outputGames;
}

/**
 * Simulates a season with randomized outcomes based on moneyline odds. Outputs
 * an object mapping team name -> number of wins
 *
 * @param gameLines Metadata for every game in the season
 */
export function simulateSeason(gameLines: GameLine[]): { [key: string]: number } {
  let out: { [key: string]: number } = {};
  gameLines.forEach((game) => {
    const random = Math.random();
    if (!(game.team1 in out)) out[game.team1] = 0;
    if (!(game.team2 in out)) out[game.team2] = 0;

    let team1WinProb = game.team1AdjustedProb;
    const k = 0.01; // Additional win probability percentage added/removed per win difference
    team1WinProb += Math.max(0, Math.min(1.0, k * (out[game.team1] - out[game.team2])));

    const winner = random <= team1WinProb ? game.team1 : game.team2;
    out[winner] += 1;
  });
  return out;
}

export type SeasonSimulationN = { [key: string]: number[] };

export function simulateSeasonNTimes(gameLines: GameLine[], n: number): SeasonSimulationN {
  let out: SeasonSimulationN = {};
  for (let i = 1; i <= n; i++) {
    const seasonResults = simulateSeason(gameLines);
    Object.keys(seasonResults).forEach((teamName) => {
      if (!(teamName in out)) out[teamName] = [];
      out[teamName].push(seasonResults[teamName]);
    });
  }
  return out;
}

export interface Result<T> {
  line: T;

  successRate: number;
  failRate: number;
  tieRate?: number;

  ev: number;
}

export function simulateSeasonWithEvolvingOdds(
  gameLines: GameLine[],
  totalWinLines: TotalWinLine[]
): { [key: string]: { outcomes: boolean[]; evolvedOdds: number[]; numWins: number } } {
  let initialRatings: { [key: string]: number } = {};
  totalWinLines.forEach((line) => {
    if (line.main) initialRatings[line.team] = line.line;
  });
  let curRatings = { ...initialRatings };

  let numWins: { [key: string]: { outcomes: boolean[]; evolvedOdds: number[]; numWins: number } } = {};

  gameLines.forEach((game) => {
    if (!(game.team1 in numWins)) numWins[game.team1] = { outcomes: [], evolvedOdds: [], numWins: 0 };
    if (!(game.team2 in numWins)) numWins[game.team2] = { outcomes: [], evolvedOdds: [], numWins: 0 };

    // console.log(`${game.team1}(${curRatings[game.team1]}) vs. ${game.team2}(${curRatings[game.team2]})`);

    const team1RatingFactor = curRatings[game.team1] / initialRatings[game.team1];
    const team2RatingFactor = curRatings[game.team2] / initialRatings[game.team2];

    const team1RatingAdjProb = game.team1AdjustedProb * team1RatingFactor;
    const team2RatingAdjProb = game.team2AdjustedProb * team2RatingFactor;

    // console.log(`${game.team1} preseason win prob: ${game.team1AdjustedProb}`);
    // console.log(`${game.team2} preseason win prob: ${game.team2AdjustedProb}`);

    const team1NormedProb = team1RatingAdjProb / (team1RatingAdjProb + team2RatingAdjProb);
    // console.log(`${game.team1} rating-adjusted win prob: ${team1NormedProb}`);
    // console.log(`${game.team2} rating-adjusted win prob: ${1 - team1NormedProb}`);

    numWins[game.team1].evolvedOdds.push(team1NormedProb);
    numWins[game.team2].evolvedOdds.push(1 - team1NormedProb);

    const k = 0.3;
    if (Math.random() <= team1NormedProb) {
      // Team 1 won
      // console.log(`${game.team1} won`);

      numWins[game.team1].outcomes.push(true);
      numWins[game.team1].numWins += 1;
      numWins[game.team2].outcomes.push(false);
      const ratingProportion = curRatings[game.team1] / curRatings[game.team2];
      curRatings[game.team1] += k / ratingProportion;
      curRatings[game.team2] -= k / ratingProportion;
    } else {
      // Team 2 won
      // console.log(`${game.team2} won`);

      numWins[game.team2].outcomes.push(true);
      numWins[game.team2].numWins += 1;
      numWins[game.team1].outcomes.push(false);
      const ratingProportion = curRatings[game.team2] / curRatings[game.team1];
      curRatings[game.team1] -= k / ratingProportion;
      curRatings[game.team2] += k / ratingProportion;
    }

    // console.log(`${game.team1} final rating: ${curRatings[game.team1]}`);
    // console.log(`${game.team2} final rating: ${curRatings[game.team2]}`);
    // console.log();
  });

  return numWins;
}

export type EvolvedSeasonSimulationN = {
  [key: string]: { outcomes: boolean[]; evolvedOdds: number[]; numWins: number }[];
};

export function simulateSeasonWithEvolvingOddsNTimes(
  gameLines: GameLine[],
  totalWinLines: TotalWinLine[],
  n: number
): SeasonSimulationN {
  let out: SeasonSimulationN = {};
  for (let i = 1; i <= n; i++) {
    const seasonResults = simulateSeasonWithEvolvingOdds(gameLines, totalWinLines);
    Object.keys(seasonResults).forEach((teamName) => {
      if (!(teamName in out)) out[teamName] = [];
      out[teamName].push(seasonResults[teamName].numWins);
    });
  }
  return out;
}

// weekNum is 0-indexed
export function getEvolvedOddsForTeamInWeekN(
  simResults: EvolvedSeasonSimulationN,
  teamName: string,
  weekNum: number
): number[] {
  let out: number[] = [];
  const teamResults = simResults[teamName];
  teamResults.forEach((teamResult) => {
    const weekOdds = teamResult.evolvedOdds[weekNum];
    out.push(weekOdds);
  });
  return out;
}
