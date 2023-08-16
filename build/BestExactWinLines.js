"use strict";
// Finds the best lines between Fanduel and DraftKings exact win lines
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFanduelExactWinLines = void 0;
const fs_1 = require("fs");
function parseFanduelExactWinLines() {
    const content = (0, fs_1.readFileSync)('./res/fanduelExactWinLines.csv', 'utf8');
    const lines = content.split('\r\n');
    let out = [];
    lines.forEach((line) => {
        const split = line.split(',');
        out.push({
            team: split[0],
            line: parseInt(split[1]),
            decimalOdds: parseFloat(split[2]),
            impliedOdds: 1 / parseFloat(split[2]),
        });
    });
    return out;
}
exports.parseFanduelExactWinLines = parseFanduelExactWinLines;
