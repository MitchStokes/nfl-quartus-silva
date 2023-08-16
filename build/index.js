"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const SeasonSim_1 = require("./SeasonSim");
const DKExactWinLines_1 = require("./DKExactWinLines");
const FanduelExactWinLines_1 = require("./FanduelExactWinLines");
const ExactWinLines_1 = require("./ExactWinLines");
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
const gameLines = (0, SeasonSim_1.parseGameLines)();
const dkExactWinLines = (0, DKExactWinLines_1.parseExactWinLines)();
const fanduelExactWinLines = (0, FanduelExactWinLines_1.parseFanduelExactWinLines)();
const bestExactWinLines = (0, ExactWinLines_1.compileBestExactWinLines)(dkExactWinLines, fanduelExactWinLines);
const chanceOfWinTotal = (0, SeasonSim_1.getChanceOfWinTotalPerTeam)(gameLines);
const exactWinAnalyses = (0, ExactWinLines_1.getExactWinAnalyses)(chanceOfWinTotal, bestExactWinLines);
const positiveEVBets = exactWinAnalyses.filter((bet) => bet.ev > 0);
const manySims = (0, SeasonSim_1.simulateSeasonNTimes)(gameLines, 100000);
const bankResults = (0, ExactWinLines_1.calculateBettingResult)(manySims, positiveEVBets, 1000);
let out = '';
bankResults.forEach((result) => (out += result + '\n'));
(0, fs_1.writeFileSync)('./results/exactWinResults.csv', out);
(0, fs_1.writeFileSync)('./results/exactWinBets.csv', (0, ExactWinLines_1.exactWinAnalysesToCsv)(exactWinAnalyses));
