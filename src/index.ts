import { write, writeFileSync } from 'fs';
import {
  GameLine,
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
import { exactWinResultToString, parseExactWinLines, testExactWinLines } from './ExactWinLines';
import {
  parseTotalWinMatchupLines,
  testTotalWinMatchupLines,
  totalWinMatchupResultToString,
} from './TotalWinMatchupLines';
import { findWorstCaseParlayOddsForTeam, parseOddsBounds } from './OddsBounds';

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

let oddsBounds = parseOddsBounds();
let parlayBounds = findWorstCaseParlayOddsForTeam('ARI Cardinals', oddsBounds);

let out: string = '';
Object.keys(parlayBounds).forEach((parlayBound: string) => {
  out += [parlayBound, parlayBounds[parseInt(parlayBound)]].join(',') + '\n';
});
writeFileSync('test.csv', out);
