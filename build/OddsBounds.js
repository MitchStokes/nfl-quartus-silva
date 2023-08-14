"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWorstCaseParlayOddsForTeam = exports.parseOddsBounds = void 0;
const fs_1 = require("fs");
function parseOddsBounds() {
    const content = (0, fs_1.readFileSync)('./res/oddsBounds.json', 'utf8');
    const root = JSON.parse(content);
    let out = {};
    Object.keys(root).forEach((teamName) => {
        const weeks = root[teamName];
        let teamOddsBounds = [];
        weeks.forEach((week) => {
            const lowerBound = week['lowerBound'];
            const upperBound = week['upperBound'];
            teamOddsBounds.push({ lowerBound, upperBound });
        });
        out[teamName] = teamOddsBounds;
    });
    return out;
}
exports.parseOddsBounds = parseOddsBounds;
function generateEveryWinLossCombo() {
    let out = [];
    for (let i = 0; i <= 131071; i++) {
        out.push(i);
    }
    return out;
}
// 0 based
function didWinIthGame(winLoss, i) {
    return (winLoss >> i) % 2 == 1;
}
function getNumberOfWinsInCombo(winLoss) {
    let wins = 0;
    for (let i = 0; i < 17; i++) {
        wins += didWinIthGame(winLoss, i) ? 1 : 0;
    }
    return wins;
}
function findWorstCaseParlayOddsForTeam(teamName, oddsBounds) {
    let out = {};
    const allCombos = generateEveryWinLossCombo();
    allCombos.forEach((winLossCombo) => {
        if (getNumberOfWinsInCombo(winLossCombo) > 4)
            return;
        let parlayValue = 1;
        oddsBounds[teamName].forEach((week, idx) => {
            if (didWinIthGame(winLossCombo, idx)) {
                parlayValue *= week.lowerBound;
            }
            else {
                parlayValue *= 1 / (1 - 1 / week.upperBound);
            }
        });
        out[winLossCombo] = parlayValue;
    });
    return out;
}
exports.findWorstCaseParlayOddsForTeam = findWorstCaseParlayOddsForTeam;
