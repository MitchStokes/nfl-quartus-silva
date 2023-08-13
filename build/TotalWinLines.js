"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalWinResultToString = exports.TOTAL_WIN_RESULT_HEADER = exports.testTotalWinLines = exports.parseTotalWinLines = void 0;
const fs_1 = require("fs");
var LineType;
(function (LineType) {
    LineType["OVER"] = "OVER";
    LineType["UNDER"] = "UNDER";
})(LineType || (LineType = {}));
function parseTotalWinLines() {
    const content = (0, fs_1.readFileSync)('./res/totalWinLines.json', 'utf8');
    const root = JSON.parse(content);
    const teamsArray = root['eventGroup']['offerCategories'][2]['offerSubcategoryDescriptors'][0]['offerSubcategory']['offers'];
    let outputLines = [];
    teamsArray.forEach((entry) => {
        const object = entry[0];
        const team = object['label'].split(' Regular Season Wins')[0];
        const outcomes = object['outcomes'];
        outcomes.forEach((outcome) => {
            if (outcome['label'] != 'Over' && outcome['label'] != 'Under')
                return;
            const type = outcome['label'] == 'Over' ? LineType.OVER : LineType.UNDER;
            const line = parseFloat(outcome['line']);
            const oddsAmerican = parseInt(outcome['oddsAmerican']);
            const oddsDecimal = parseFloat(outcome['oddsDecimal']);
            const impliedProb = 1 / oddsDecimal;
            outputLines.push({
                team,
                type,
                line,
                oddsAmerican,
                oddsDecimal,
                impliedProb,
            });
        });
    });
    return outputLines;
}
exports.parseTotalWinLines = parseTotalWinLines;
function testTotalWinLines(lines, seasonResults) {
    let outputResults = [];
    lines.forEach((line) => {
        const n = seasonResults[line.team].length;
        let successes = 0;
        let fails = 0;
        let ties = 0;
        seasonResults[line.team].forEach((winCount) => {
            ties += winCount == line.line ? 1 : 0;
            if (line.type == LineType.OVER) {
                successes += winCount > line.line ? 1 : 0;
                fails += winCount < line.line ? 1 : 0;
            }
            else {
                successes += winCount < line.line ? 1 : 0;
                fails += winCount > line.line ? 1 : 0;
            }
        });
        const successRate = successes / n;
        const failRate = fails / n;
        const tieRate = ties / n;
        const ev = successRate * (line.oddsDecimal - 1) - failRate;
        outputResults.push({
            line,
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
    return outputResults;
}
exports.testTotalWinLines = testTotalWinLines;
exports.TOTAL_WIN_RESULT_HEADER = 'team,type,line,american,decimal,impliedProb,n,successes,fails,ties,successRate,failRate,tieRate,ev';
function totalWinResultToString(result) {
    return [
        result.line.team,
        result.line.type,
        result.line.line,
        result.line.oddsAmerican,
        result.line.oddsDecimal,
        result.line.impliedProb,
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
exports.totalWinResultToString = totalWinResultToString;
