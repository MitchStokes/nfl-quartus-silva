"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateSeasonNTimes = exports.simulateSeason = exports.parseGameLines = void 0;
const fs_1 = require("fs");
function parseGameLines() {
    const content = (0, fs_1.readFileSync)('./res/gameLines.json', 'utf8');
    const root = JSON.parse(content);
    const gameArray = root['eventGroup']['offerCategories'][0]['offerSubcategoryDescriptors'][0]['offerSubcategory']['offers'];
    let outputGames = [];
    gameArray.forEach((game) => {
        const outcomes = game[2]['outcomes'];
        const team1 = outcomes[0]['participant'];
        const team1OddsAmerican = parseInt(outcomes[0]['oddsAmerican']);
        const team1OddsDecimal = parseFloat(outcomes[0]['oddsDecimal']);
        const team1ImpliedProb = 1 / team1OddsDecimal;
        const team2 = outcomes[1]['participant'];
        const team2OddsAmerican = parseInt(outcomes[1]['oddsAmerican']);
        const team2OddsDecimal = parseFloat(outcomes[1]['oddsDecimal']);
        const team2ImpliedProb = 1 / team2OddsDecimal;
        const team1AdjustedProb = team1ImpliedProb / (team1ImpliedProb + team2ImpliedProb);
        const team2AdjustedProb = team2ImpliedProb / (team1ImpliedProb + team2ImpliedProb);
        outputGames.push({
            team1,
            team1OddsAmerican,
            team1OddsDecimal,
            team1ImpliedProb,
            team2,
            team2OddsAmerican,
            team2OddsDecimal,
            team2ImpliedProb,
            team1AdjustedProb,
            team2AdjustedProb,
        });
    });
    return outputGames;
}
exports.parseGameLines = parseGameLines;
/**
 * Simulates a season with randomized outcomes based on moneyline odds. Outputs
 * an object mapping team name -> number of wins
 *
 * @param gameLines Metadata for every game in the season
 */
function simulateSeason(gameLines) {
    let out = {};
    gameLines.forEach((game) => {
        const random = Math.random();
        if (!(game.team1 in out))
            out[game.team1] = 0;
        if (!(game.team2 in out))
            out[game.team2] = 0;
        const winner = random <= game.team1AdjustedProb ? game.team1 : game.team2;
        out[winner] += 1;
    });
    return out;
}
exports.simulateSeason = simulateSeason;
function simulateSeasonNTimes(gameLines, n) {
    let out = {};
    for (let i = 1; i <= n; i++) {
        const seasonResults = simulateSeason(gameLines);
        Object.keys(seasonResults).forEach((teamName) => {
            if (!(teamName in out))
                out[teamName] = [];
            out[teamName].push(seasonResults[teamName]);
        });
    }
    return out;
}
exports.simulateSeasonNTimes = simulateSeasonNTimes;
