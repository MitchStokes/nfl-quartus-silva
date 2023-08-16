"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateSyntheticParlayBetting = void 0;
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
function simulateSyntheticParlayBetting(gameLines, totalWinLines, teamName) {
    let initialRatings = {};
    totalWinLines.forEach((line) => {
        if (line.main)
            initialRatings[line.team] = line.line;
    });
    let curRatings = Object.assign({}, initialRatings);
    let bank = 1;
    let teamWins = 0;
    let teamGamesPlayed = 0;
    gameLines.forEach((game) => {
        const team1RatingFactor = curRatings[game.team1] / initialRatings[game.team1];
        const team2RatingFactor = curRatings[game.team2] / initialRatings[game.team2];
        const team1RatingAdjProb = game.team1AdjustedProb * team1RatingFactor;
        const team2RatingAdjProb = game.team2AdjustedProb * team2RatingFactor;
        const team1NormedProb = team1RatingAdjProb / (team1RatingAdjProb + team2RatingAdjProb);
        const team2NormedProb = team2RatingAdjProb / (team1RatingAdjProb + team2RatingAdjProb);
        let team1BetAmount = 0;
        let team2BetAmount = 0;
        if (game.team1 == teamName && teamWins < 4) {
            team1BetAmount = (bank * (4 - teamWins)) / (17 - teamGamesPlayed);
            team2BetAmount = bank * (1 - (4 - teamWins) / (17 - teamGamesPlayed));
        }
        else if (game.team2 == teamName && teamWins < 4) {
            team1BetAmount = bank * (1 - (4 - teamWins) / (17 - teamGamesPlayed));
            team2BetAmount = (bank * (4 - teamWins)) / (17 - teamGamesPlayed);
        }
        const k = 0.3;
        if (Math.random() <= team1NormedProb) {
            // Team 1 won
            const ratingProportion = curRatings[game.team1] / curRatings[game.team2];
            curRatings[game.team1] += k / ratingProportion;
            curRatings[game.team2] -= k / ratingProportion;
            if (team1BetAmount)
                bank = team1BetAmount * (1 / team1NormedProb) * 0.975;
            if (game.team1 == teamName)
                teamWins++;
        }
        else {
            // Team 2 won
            const ratingProportion = curRatings[game.team2] / curRatings[game.team1];
            curRatings[game.team1] -= k / ratingProportion;
            curRatings[game.team2] += k / ratingProportion;
            if (team2BetAmount)
                bank = team2BetAmount * (1 / team2NormedProb) * 0.975;
            if (game.team2 == teamName)
                teamWins++;
        }
        if (game.team1 == teamName || game.team2 == teamName) {
            teamGamesPlayed++;
            console.log(bank, teamGamesPlayed, teamWins);
        }
    });
    console.log(teamWins);
}
exports.simulateSyntheticParlayBetting = simulateSyntheticParlayBetting;
