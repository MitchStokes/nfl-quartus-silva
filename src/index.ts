import { write, writeFileSync } from 'fs';
import {
  GameLine,
  getChanceOfWinTotalPerTeam,
  getEvolvedOddsForTeamInWeekN,
  parseGameLines,
  simulateSeason,
  simulateSeasonNTimes,
  simulateSeasonWithEvolvingOdds,
  simulateSeasonWithEvolvingOddsNTimes,
} from './SeasonSim';
import {
  totalWinResultToString,
  parseTotalWinLines,
  testTotalWinLines,
  TOTAL_WIN_RESULT_HEADER,
} from './TotalWinLines';
import { exactWinResultToString, parseExactWinLines, testExactWinLines } from './DKExactWinLines';
import {
  parseTotalWinMatchupLines,
  testTotalWinMatchupLines,
  totalWinMatchupResultToString,
} from './TotalWinMatchupLines';
import { findWorstCaseParlayOddsForTeam, parseOddsBounds } from './OddsBounds';
import { simulateSyntheticParlayBetting } from './ParlayEstimator';
import { parseFanduelExactWinLines } from './FanduelExactWinLines';
import {
  calculateBettingResult,
  compileBestExactWinLines,
  exactWinAnalysesToCsv,
  getExactWinAnalyses,
} from './ExactWinLines';

/*
const gameLines = parseGameLines();
const totalWinLines = parseTotalWinLines();
const exactWinLines = parseExactWinLines();
const totalWinMatchupLines = parseTotalWinMatchupLines();

const simulationResults = simulateSeasonWithEvolvingOddsNTimes(gameLines, totalWinLines, 100000);
const totalWinResults = testTotalWinLines(totalWinLines, simulationResults);
const exactWinResults = testExactWinLines(exactWinLines, simulationResults);
const totalWinMatchupResults = testTotalWinMatchupLines(totalWinMatchupLines, simulationResults);

let output: string = TOTAL_WIN_RESULT_HEADER + '\n';
totalWinResults.forEach((totalWinResult) => {
  output += totalWinResultToString(totalWinResult) + '\n';
});
exactWinResults.forEach((exactWinResult) => {
  output += exactWinResultToString(exactWinResult) + '\n';
});
totalWinMatchupResults.forEach((totalWinMatchupResult) => {
  output += totalWinMatchupResultToString(totalWinMatchupResult) + '\n';
});
writeFileSync('results.csv', output);
*/

/*
let oddsBounds = parseOddsBounds();
let parlayBounds = findWorstCaseParlayOddsForTeam('ARI Cardinals', oddsBounds);

let out: string = '';
Object.keys(parlayBounds).forEach((parlayBound: string) => {
  out += [parlayBound, parlayBounds[parseInt(parlayBound)]].join(',') + '\n';
});
writeFileSync('test.csv', out);
*/

const bankroll = 1000;
const numSims = 100000;

const gameLines = parseGameLines();
const totalWinLines = parseTotalWinLines();
const dkExactWinLines = parseExactWinLines();
const fanduelExactWinLines = parseFanduelExactWinLines();
const bestExactWinLines = compileBestExactWinLines(dkExactWinLines, fanduelExactWinLines);

const manySims = simulateSeasonWithEvolvingOddsNTimes(gameLines, totalWinLines, numSims);
const chanceOfWinTotal = getChanceOfWinTotalPerTeam(manySims);
const exactWinAnalyses = getExactWinAnalyses(chanceOfWinTotal, bestExactWinLines);
const positiveEVBets = exactWinAnalyses.filter((bet) => bet.ev > 0);
const bankResults = calculateBettingResult(manySims, positiveEVBets, bankroll);

let out: string = '';
for (let i = 0; i < bankResults.bankResults.length; i++) {
  out += bankResults.bankResults[i] + ',' + bankResults.numBetsWon[i] + '\n';
}
writeFileSync('./results/exactWinResults.csv', out);
writeFileSync('./results/exactWinBets.csv', exactWinAnalysesToCsv(positiveEVBets, bankroll));

/*
let sum = 0;
bankResults.betAmountsForWonBets.forEach((wonBet) => (sum += wonBet));
console.log(sum / bankResults.betAmountsForWonBets.length);
sum = 0;
bankResults.betAmountsForLostBets.forEach((wonBet) => (sum += wonBet));
console.log(sum / bankResults.betAmountsForLostBets.length);
*/

/*
  Average won bet amount = 0.0079
  Average lost bet amount = 0.0075
  Average won bet mult = 7.68
*/
