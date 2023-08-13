"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalWinMatchupResultToString = exports.testTotalWinMatchupLines = exports.parseTotalWinMatchupLines = void 0;
const fs_1 = require("fs");
function parseTotalWinMatchupLines() {
    const content = (0, fs_1.readFileSync)('./res/totalWinMatchupLines.json', 'utf8');
    const root = JSON.parse(content);
    const linesArray = root['eventGroup']['offerCategories'][2]['offerSubcategoryDescriptors'][2]['offerSubcategory']['offers'][0];
    let outputLines = [];
    linesArray.forEach((entry) => {
        const outcomes = entry['outcomes'];
        if (outcomes.length != 2)
            return;
        const oc1 = outcomes[0];
        const team1 = oc1['label'];
        const team1OddsAmerican = parseInt(oc1['oddsAmerican']);
        const team1OddsDecimal = parseFloat(oc1['oddsDecimal']);
        const team1ImpliedProb = 1 / team1OddsDecimal;
        const oc2 = outcomes[1];
        const team2 = oc2['label'];
        const team2OddsAmerican = parseInt(oc2['oddsAmerican']);
        const team2OddsDecimal = parseFloat(oc2['oddsDecimal']);
        const team2ImpliedProb = 1 / team2OddsDecimal;
        outputLines.push({
            team1,
            team1OddsAmerican,
            team1OddsDecimal,
            team1ImpliedProb,
            team2,
            team2OddsAmerican,
            team2OddsDecimal,
            team2ImpliedProb,
        });
    });
    return outputLines;
}
exports.parseTotalWinMatchupLines = parseTotalWinMatchupLines;
var TotalWinMatchupOption;
(function (TotalWinMatchupOption) {
    TotalWinMatchupOption[TotalWinMatchupOption["TEAM_1"] = 1] = "TEAM_1";
    TotalWinMatchupOption[TotalWinMatchupOption["TEAM_2"] = 2] = "TEAM_2";
})(TotalWinMatchupOption || (TotalWinMatchupOption = {}));
function testTotalWinMatchupLines(lines, seasonResults) {
    let outputResults = [];
    lines.forEach((line) => {
        [TotalWinMatchupOption.TEAM_1, TotalWinMatchupOption.TEAM_2].forEach((choice) => {
            const n = seasonResults[line.team1].length;
            let successes = 0;
            let fails = 0;
            let ties = 0;
            for (let i = 0; i < n; i++) {
                const team1WinCount = seasonResults[line.team1][i];
                const team2WinCount = seasonResults[line.team2][i];
                ties += team1WinCount == team2WinCount ? 1 : 0;
                if (choice == TotalWinMatchupOption.TEAM_1) {
                    successes += team1WinCount > team2WinCount ? 1 : 0;
                    fails += team1WinCount < team2WinCount ? 1 : 0;
                }
                else {
                    successes += team1WinCount < team2WinCount ? 1 : 0;
                    fails += team1WinCount > team2WinCount ? 1 : 0;
                }
            }
            const successRate = successes / n;
            const failRate = fails / n;
            const tieRate = ties / n;
            const ev = successRate * (choice == TotalWinMatchupOption.TEAM_1 ? line.team1OddsDecimal - 1 : line.team2OddsDecimal - 1) -
                failRate;
            outputResults.push({
                line,
                teamChoice: choice,
                n,
                successes,
                fails,
                ties,
                successRate,
                failRate,
                tieRate,
                ev,
            });
        });
    });
    return outputResults;
}
exports.testTotalWinMatchupLines = testTotalWinMatchupLines;
function totalWinMatchupResultToString(result) {
    return [
        result.line.team1 + ' vs. ' + result.line.team2,
        `MATCHUP`,
        result.teamChoice == TotalWinMatchupOption.TEAM_1 ? result.line.team1 : result.line.team2,
        result.teamChoice == TotalWinMatchupOption.TEAM_1 ? result.line.team1OddsAmerican : result.line.team2OddsAmerican,
        result.teamChoice == TotalWinMatchupOption.TEAM_1 ? result.line.team1OddsDecimal : result.line.team2OddsDecimal,
        result.teamChoice == TotalWinMatchupOption.TEAM_1 ? result.line.team1ImpliedProb : result.line.team2ImpliedProb,
        result.n,
        result.successes,
        result.fails,
        result.ties,
        result.successRate,
        result.failRate,
        result.tieRate,
        result.ev,
    ].join(',');
}
exports.totalWinMatchupResultToString = totalWinMatchupResultToString;
