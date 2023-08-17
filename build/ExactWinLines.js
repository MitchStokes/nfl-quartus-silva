"use strict";
// Finds the best lines between Fanduel and DraftKings exact win lines
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBettingResult = exports.exactWinAnalysesToCsv = exports.getExactWinAnalyses = exports.compileBestExactWinLines = exports.Sportsbook = void 0;
var Sportsbook;
(function (Sportsbook) {
    Sportsbook["DK"] = "DraftKings";
    Sportsbook["FANDUEL"] = "FanDuel";
})(Sportsbook || (exports.Sportsbook = Sportsbook = {}));
function compileBestExactWinLines(dkLines, fanduelLines) {
    let out = [];
    dkLines.forEach((dkLine) => {
        const fanduelLine = fanduelLines.filter((fdLine) => dkLine.team == fdLine.team && dkLine.line == fdLine.line)[0];
        if (!fanduelLine || dkLine.oddsDecimal >= fanduelLine.decimalOdds) {
            out.push({
                team: dkLine.team,
                line: dkLine.line,
                decimalOdds: dkLine.oddsDecimal,
                impliedProb: 1 / dkLine.oddsDecimal,
                sportsbook: Sportsbook.DK,
            });
        }
        else {
            out.push({
                team: fanduelLine.team,
                line: fanduelLine.line,
                decimalOdds: fanduelLine.decimalOdds,
                impliedProb: 1 / fanduelLine.decimalOdds,
                sportsbook: Sportsbook.FANDUEL,
            });
        }
    });
    return out;
}
exports.compileBestExactWinLines = compileBestExactWinLines;
function getExactWinAnalyses(realChances, exactWinLines) {
    let out = [];
    Object.keys(realChances).forEach((team) => {
        Object.keys(realChances[team]).forEach((wins) => {
            const winTotal = parseInt(wins);
            const exactWinLine = exactWinLines.filter((line) => line.team == team && line.line == winTotal)[0];
            const decimalOdds = exactWinLine.decimalOdds;
            const impliedProb = exactWinLine.impliedProb;
            const realProb = realChances[team][winTotal];
            const ev = realProb * (decimalOdds - 1) - (1 - realProb);
            out.push({
                team,
                winTotal,
                decimalOdds,
                impliedProb,
                sportsbook: exactWinLine.sportsbook,
                realProb,
                ev,
            });
        });
    });
    return out;
}
exports.getExactWinAnalyses = getExactWinAnalyses;
function exactWinAnalysesToCsv(analyses) {
    let out = '';
    analyses.forEach((analysis) => {
        if (!isNaN(analysis.realProb)) {
            out +=
                [
                    analysis.team,
                    analysis.winTotal,
                    analysis.decimalOdds,
                    analysis.impliedProb,
                    analysis.sportsbook,
                    analysis.realProb,
                    analysis.ev,
                ].join(',') + '\n';
        }
    });
    return out;
}
exports.exactWinAnalysesToCsv = exactWinAnalysesToCsv;
function calculateBettingResult(seasonSims, bets, bankroll) {
    let totalProb = 0;
    bets.forEach((bet) => (totalProb += bet.realProb));
    let betAmounts = [];
    bets.forEach((bet) => betAmounts.push({ bet, amount: (bet.realProb * bankroll) / totalProb }));
    let results = [];
    let betAmountsForWonBets = [];
    let betAmountsForLostBets = [];
    let simCount = seasonSims[Object.keys(seasonSims)[0]].length;
    for (let simNum = 0; simNum < simCount; simNum++) {
        let bank = 0;
        let odds = [];
        betAmounts.forEach((bet) => {
            if (seasonSims[bet.bet.team][simNum] == bet.bet.winTotal)
                bank += bet.amount * bet.bet.decimalOdds;
            if (seasonSims[bet.bet.team][simNum] == bet.bet.winTotal)
                betAmountsForWonBets.push(bet.bet.decimalOdds);
            if (seasonSims[bet.bet.team][simNum] != bet.bet.winTotal)
                betAmountsForLostBets.push(bet.bet.decimalOdds);
        });
        results.push(bank);
    }
    return {
        bankResults: results,
        betAmountsForWonBets,
        betAmountsForLostBets,
    };
}
exports.calculateBettingResult = calculateBettingResult;
