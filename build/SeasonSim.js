"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChanceOfWinTotalPerTeam = exports.getEvolvedOddsForTeamInWeekN = exports.simulateSeasonWithEvolvingOddsNTimes = exports.simulateSeasonWithEvolvingOdds = exports.simulateSeasonNTimes = exports.simulateSeason = exports.parseGameLines = void 0;
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
        let team1WinProb = game.team1AdjustedProb;
        const winner = random <= team1WinProb ? game.team1 : game.team2;
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
function simulateSeasonWithEvolvingOdds(gameLines, totalWinLines) {
    let initialRatings = {};
    totalWinLines.forEach((line) => {
        if (line.main)
            initialRatings[line.team] = line.line;
    });
    let curRatings = Object.assign({}, initialRatings);
    let numWins = {};
    gameLines.forEach((game) => {
        if (!(game.team1 in numWins))
            numWins[game.team1] = { outcomes: [], evolvedOdds: [], numWins: 0 };
        if (!(game.team2 in numWins))
            numWins[game.team2] = { outcomes: [], evolvedOdds: [], numWins: 0 };
        // console.log(`${game.team1}(${curRatings[game.team1]}) vs. ${game.team2}(${curRatings[game.team2]})`);
        const team1RatingFactor = curRatings[game.team1] / initialRatings[game.team1];
        const team2RatingFactor = curRatings[game.team2] / initialRatings[game.team2];
        const team1RatingAdjProb = game.team1AdjustedProb * team1RatingFactor;
        const team2RatingAdjProb = game.team2AdjustedProb * team2RatingFactor;
        // console.log(`${game.team1} preseason win prob: ${game.team1AdjustedProb}`);
        // console.log(`${game.team2} preseason win prob: ${game.team2AdjustedProb}`);
        const team1NormedProb = team1RatingAdjProb / (team1RatingAdjProb + team2RatingAdjProb);
        // console.log(`${game.team1} rating-adjusted win prob: ${team1NormedProb}`);
        // console.log(`${game.team2} rating-adjusted win prob: ${1 - team1NormedProb}`);
        numWins[game.team1].evolvedOdds.push(team1NormedProb);
        numWins[game.team2].evolvedOdds.push(1 - team1NormedProb);
        const k = 0.3;
        if (Math.random() <= team1NormedProb) {
            // Team 1 won
            // console.log(`${game.team1} won`);
            numWins[game.team1].outcomes.push(true);
            numWins[game.team1].numWins += 1;
            numWins[game.team2].outcomes.push(false);
            const ratingProportion = curRatings[game.team1] / curRatings[game.team2];
            curRatings[game.team1] += k / ratingProportion;
            curRatings[game.team2] -= k / ratingProportion;
        }
        else {
            // Team 2 won
            // console.log(`${game.team2} won`);
            numWins[game.team2].outcomes.push(true);
            numWins[game.team2].numWins += 1;
            numWins[game.team1].outcomes.push(false);
            const ratingProportion = curRatings[game.team2] / curRatings[game.team1];
            curRatings[game.team1] -= k / ratingProportion;
            curRatings[game.team2] += k / ratingProportion;
        }
        // console.log(`${game.team1} final rating: ${curRatings[game.team1]}`);
        // console.log(`${game.team2} final rating: ${curRatings[game.team2]}`);
        // console.log();
    });
    return numWins;
}
exports.simulateSeasonWithEvolvingOdds = simulateSeasonWithEvolvingOdds;
function simulateSeasonWithEvolvingOddsNTimes(gameLines, totalWinLines, n) {
    let out = {};
    for (let i = 1; i <= n; i++) {
        const seasonResults = simulateSeasonWithEvolvingOdds(gameLines, totalWinLines);
        Object.keys(seasonResults).forEach((teamName) => {
            if (!(teamName in out))
                out[teamName] = [];
            out[teamName].push(seasonResults[teamName].numWins);
        });
    }
    return out;
}
exports.simulateSeasonWithEvolvingOddsNTimes = simulateSeasonWithEvolvingOddsNTimes;
// weekNum is 0-indexed
function getEvolvedOddsForTeamInWeekN(simResults, teamName, weekNum) {
    let out = [];
    const teamResults = simResults[teamName];
    teamResults.forEach((teamResult) => {
        const weekOdds = teamResult.evolvedOdds[weekNum];
        out.push(weekOdds);
    });
    return out;
}
exports.getEvolvedOddsForTeamInWeekN = getEvolvedOddsForTeamInWeekN;
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
function getChanceOfWinTotalPerTeam(gameLines) {
    function getAdjustedOdds(winOdds, lossOdds) {
        return {
            win: (winOdds + lossOdds) / lossOdds,
            loss: (winOdds + lossOdds) / winOdds,
        };
    }
    let allTeamNames = [];
    gameLines.forEach((game) => {
        if (!allTeamNames.includes(game.team1))
            allTeamNames.push(game.team1);
        if (!allTeamNames.includes(game.team2))
            allTeamNames.push(game.team2);
    });
    const allCombos = generateEveryWinLossCombo();
    let out = {};
    allTeamNames.forEach((teamName) => {
        out[teamName] = {};
        const relevantGames = gameLines.filter((game) => game.team1 == teamName || game.team2 == teamName);
        allCombos.forEach((combo) => {
            const winCount = getNumberOfWinsInCombo(combo);
            let implOdds = 1;
            for (let i = 0; i < 17; i++) {
                const winOdds = relevantGames[i].team1 == teamName ? relevantGames[i].team1OddsDecimal : relevantGames[i].team2OddsDecimal;
                const lossOdds = relevantGames[i].team1 == teamName ? relevantGames[i].team2OddsDecimal : relevantGames[i].team1OddsDecimal;
                implOdds *= didWinIthGame(combo, i)
                    ? getAdjustedOdds(winOdds, lossOdds).win
                    : getAdjustedOdds(winOdds, lossOdds).loss;
            }
            out[teamName][winCount] = (out[teamName][winCount] || 0) + 1 / implOdds;
        });
    });
    return out;
}
exports.getChanceOfWinTotalPerTeam = getChanceOfWinTotalPerTeam;
