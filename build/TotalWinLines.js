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
            const main = outcome['main'];
            outputLines.push({
                team,
                type,
                main,
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
/* export function findBestResultPerTeam(results: TotalWinResult[]): { [key: string]: TotalWinResult } {
  let outDict: { [key: string]: TotalWinResult } = {};
  results.forEach((result) => {
    if (!(result.line.team in outDict) || outDict[result.line.team].ev < result.ev) outDict[result.line.team] = result;
  });
  return outDict;
}

export function simulateBets(
  bankroll: number,
  bets: { [key: string]: TotalWinResult },
  seasonResults: { [key: string]: number[] }
): [{ teamName: string; line: TotalWinLine; betSize: number }[], number[]] {
  let totalEv = 0;
  Object.keys(bets).forEach((teamName) => {
    totalEv += bets[teamName].ev;
  });
  let betAmounts: { teamName: string; line: TotalWinLine; betSize: number }[] = [];
  Object.keys(bets).forEach((teamName) => {
    betAmounts.push({
      teamName,
      line: bets[teamName].line,
      betSize: (bankroll * bets[teamName].ev) / totalEv,
    });
  });

  const teamNames = Object.keys(seasonResults);
  let bankResults: number[] = [];
  for (let i = 0; i < seasonResults[teamNames[0]].length; i++) {
    let bank = 0;
    betAmounts.forEach((bet) => {
      const winCount = seasonResults[bet.teamName][i];
      if (winCount == bet.line.line) bank += bet.betSize;
      if (bet.line.type == LineType.OVER && winCount > bet.line.line) bank += bet.betSize * bet.line.oddsDecimal;
      if (bet.line.type == LineType.UNDER && winCount < bet.line.line) bank += bet.betSize * bet.line.oddsDecimal;
    });
    bankResults.push(bank);
  }

  return [betAmounts, bankResults];
} */
