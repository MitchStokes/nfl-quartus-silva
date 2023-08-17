"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const SeasonSim_1 = require("./SeasonSim");
const TotalWinLines_1 = require("./TotalWinLines");
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
const bankroll = 1000;
const numSims = 100000;
const gameLines = (0, SeasonSim_1.parseGameLines)();
const totalWinLines = (0, TotalWinLines_1.parseTotalWinLines)();
const dkExactWinLines = (0, DKExactWinLines_1.parseExactWinLines)();
const fanduelExactWinLines = (0, FanduelExactWinLines_1.parseFanduelExactWinLines)();
const bestExactWinLines = (0, ExactWinLines_1.compileBestExactWinLines)(dkExactWinLines, fanduelExactWinLines);
const manySims = (0, SeasonSim_1.simulateSeasonWithEvolvingOddsNTimes)(gameLines, totalWinLines, numSims);
const chanceOfWinTotal = (0, SeasonSim_1.getChanceOfWinTotalPerTeam)(manySims);
const exactWinAnalyses = (0, ExactWinLines_1.getExactWinAnalyses)(chanceOfWinTotal, bestExactWinLines);
const positiveEVBets = exactWinAnalyses.filter((bet) => bet.ev > 0);
const bankResults = (0, ExactWinLines_1.calculateBettingResult)(manySims, positiveEVBets, bankroll);
let out = '';
for (let i = 0; i < bankResults.bankResults.length; i++) {
    out += bankResults.bankResults[i] + ',' + bankResults.numBetsWon[i] + '\n';
}
(0, fs_1.writeFileSync)('./results/exactWinResults.csv', out);
(0, fs_1.writeFileSync)('./results/exactWinBets.csv', (0, ExactWinLines_1.exactWinAnalysesToCsv)(positiveEVBets, bankroll));
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
