"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const SeasonSim_1 = require("./SeasonSim");
const TotalWinLines_1 = require("./TotalWinLines");
const ExactWinLines_1 = require("./ExactWinLines");
const TotalWinMatchupLines_1 = require("./TotalWinMatchupLines");
const gameLines = (0, SeasonSim_1.parseGameLines)();
const simulationResults = (0, SeasonSim_1.simulateSeasonNTimes)(gameLines, 1000000);
const totalWinLines = (0, TotalWinLines_1.parseTotalWinLines)();
const exactWinLines = (0, ExactWinLines_1.parseExactWinLines)();
const totalWinMatchupLines = (0, TotalWinMatchupLines_1.parseTotalWinMatchupLines)();
const totalWinResults = (0, TotalWinLines_1.testTotalWinLines)(totalWinLines, simulationResults);
const exactWinResults = (0, ExactWinLines_1.testExactWinLines)(exactWinLines, simulationResults);
const totalWinMatchupResults = (0, TotalWinMatchupLines_1.testTotalWinMatchupLines)(totalWinMatchupLines, simulationResults);
let output = TotalWinLines_1.TOTAL_WIN_RESULT_HEADER + '\n';
totalWinResults.forEach((totalWinResult) => {
    output += (0, TotalWinLines_1.totalWinResultToString)(totalWinResult) + '\n';
});
exactWinResults.forEach((exactWinResult) => {
    output += (0, ExactWinLines_1.exactWinResultToString)(exactWinResult) + '\n';
});
totalWinMatchupResults.forEach((totalWinMatchupResult) => {
    output += (0, TotalWinMatchupLines_1.totalWinMatchupResultToString)(totalWinMatchupResult) + '\n';
});
(0, fs_1.writeFileSync)('results.csv', output);
