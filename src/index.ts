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

const gameLines = parseGameLines();
const dkExactWinLines = parseExactWinLines();
const fanduelExactWinLines = parseFanduelExactWinLines();
const bestExactWinLines = compileBestExactWinLines(dkExactWinLines, fanduelExactWinLines);

const chanceOfWinTotal = getChanceOfWinTotalPerTeam(gameLines);
const exactWinAnalyses = getExactWinAnalyses(chanceOfWinTotal, bestExactWinLines);
const positiveEVBets = exactWinAnalyses.filter((bet) => bet.ev > 0);
const manySims = simulateSeasonNTimes(gameLines, 100000);
const bankResults = calculateBettingResult(manySims, positiveEVBets, 1000);

let out: string = '';
bankResults.forEach((result) => (out += result + '\n'));
writeFileSync('./results/exactWinResults.csv', out);
writeFileSync('./results/exactWinBets.csv', exactWinAnalysesToCsv(exactWinAnalyses));
