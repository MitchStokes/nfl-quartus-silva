"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const OddsBounds_1 = require("./OddsBounds");
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
let oddsBounds = (0, OddsBounds_1.parseOddsBounds)();
let parlayBounds = (0, OddsBounds_1.findWorstCaseParlayOddsForTeam)('ARI Cardinals', oddsBounds);
let out = '';
Object.keys(parlayBounds).forEach((parlayBound) => {
    out += [parlayBound, parlayBounds[parseInt(parlayBound)]].join(',') + '\n';
});
(0, fs_1.writeFileSync)('test.csv', out);
