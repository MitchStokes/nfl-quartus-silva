import { writeFileSync } from 'fs';
import { parseGameLines, simulateSeason, simulateSeasonNTimes } from './SeasonSim';
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

const gameLines = parseGameLines();
const simulationResults = simulateSeasonNTimes(gameLines, 1000000);
const totalWinLines = parseTotalWinLines();
const exactWinLines = parseExactWinLines();
const totalWinMatchupLines = parseTotalWinMatchupLines();

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
