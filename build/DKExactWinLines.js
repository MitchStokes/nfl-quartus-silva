"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exactWinResultToString = exports.testExactWinLines = exports.parseExactWinLines = void 0;
const fs_1 = require("fs");
function parseExactWinLines() {
    const content = (0, fs_1.readFileSync)('./res/exactWinLines.json', 'utf8');
    const root = JSON.parse(content);
    const teamsArray = root['eventGroup']['offerCategories'][2]['offerSubcategoryDescriptors'][1]['offerSubcategory']['offers'];
    let outputLines = [];
    teamsArray.forEach((entry) => {
        const object = entry[0];
        const eventId = object['eventId'];
        const outcomes = object['outcomes'];
        outcomes.forEach((outcome) => {
            const line = parseInt(outcome['label']);
            const oddsAmerican = parseInt(outcome['oddsAmerican']);
            const oddsDecimal = parseFloat(outcome['oddsDecimal']);
            const impliedProb = 1 / oddsDecimal;
            outputLines.push({
                team: undefined,
                eventId,
                line,
                oddsAmerican,
                oddsDecimal,
                impliedProb,
            });
        });
        const eventsArray = root['eventGroup']['events'];
        let eventIdToTeamMap = {};
        eventsArray.forEach((event) => {
            const eventId = event['eventId'];
            const teamName = event['name'].split(' 2023/24')[0];
            eventIdToTeamMap[eventId] = teamName;
        });
        outputLines.forEach((outputLine) => {
            outputLine.team = eventIdToTeamMap[outputLine.eventId];
        });
    });
    return outputLines;
}
exports.parseExactWinLines = parseExactWinLines;
function testExactWinLines(lines, seasonResults) {
    let outputResults = [];
    lines.forEach((line) => {
        if (!line.team)
            return;
        const n = seasonResults[line.team].length;
        let successes = 0;
        let fails = 0;
        seasonResults[line.team].forEach((winCount) => {
            successes += winCount == line.line ? 1 : 0;
            fails += winCount != line.line ? 1 : 0;
        });
        const successRate = successes / n;
        const failRate = fails / n;
        const ev = successRate * (line.oddsDecimal - 1) - failRate;
        outputResults.push({
            line,
            n,
            successes,
            fails,
            successRate,
            failRate,
            ev,
        });
    });
    return outputResults;
}
exports.testExactWinLines = testExactWinLines;
function exactWinResultToString(result) {
    return [
        result.line.team,
        'EXACT',
        result.line.line,
        result.line.oddsAmerican,
        result.line.oddsDecimal,
        result.line.impliedProb,
        result.n,
        result.successes,
        result.fails,
        0,
        result.successRate,
        result.failRate,
        0,
        result.ev,
    ].join(',');
}
exports.exactWinResultToString = exactWinResultToString;
