// Finds the best lines between Fanduel and DraftKings exact win lines

import { DKExactWinLine } from './DKExactWinLines';
import { FanduelExactWinLine } from './FanduelExactWinLines';
import { SeasonSimulationN } from './SeasonSim';

export enum Sportsbook {
  DK = 'DraftKings',
  FANDUEL = 'FanDuel',
}

export interface BestExactWinLine {
  team: string;
  line: number;
  decimalOdds: number;
  impliedProb: number;
  sportsbook: Sportsbook;
}

export function compileBestExactWinLines(
  dkLines: DKExactWinLine[],
  fanduelLines: FanduelExactWinLine[]
): BestExactWinLine[] {
  let out: BestExactWinLine[] = [];

  dkLines.forEach((dkLine) => {
    const fanduelLine = fanduelLines.filter((fdLine) => dkLine.team == fdLine.team && dkLine.line == fdLine.line)[0];
    if (!fanduelLine || dkLine.oddsDecimal >= fanduelLine.decimalOdds) {
      out.push({
        team: dkLine.team as string,
        line: dkLine.line,
        decimalOdds: dkLine.oddsDecimal,
        impliedProb: 1 / dkLine.oddsDecimal,
        sportsbook: Sportsbook.DK,
      });
    } else {
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

export interface ExactWinAnalysis {
  team: string;
  winTotal: number;
  decimalOdds: number;
  impliedProb: number;
  sportsbook: Sportsbook;
  realProb: number;
  ev: number;
}

export function getExactWinAnalyses(
  realChances: { [key: string]: { [key: number]: number } },
  exactWinLines: BestExactWinLine[]
): ExactWinAnalysis[] {
  let out: ExactWinAnalysis[] = [];
  Object.keys(realChances).forEach((team) => {
    Object.keys(realChances[team]).forEach((wins) => {
      const winTotal = parseInt(wins);
      const exactWinLine: BestExactWinLine = exactWinLines.filter(
        (line) => line.team == team && line.line == winTotal
      )[0];
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

export function exactWinAnalysesToCsv(analyses: ExactWinAnalysis[], bankroll: number): string {
  let betAmounts: { bet: ExactWinAnalysis; amount: number }[] = [];
  betAmounts.push({ bet: analyses[0], amount: 5 });
  for (let i = 1; i < analyses.length; i++) {
    betAmounts.push({
      bet: analyses[i],
      amount:
        ((betAmounts[0].amount * betAmounts[0].bet.decimalOdds) / betAmounts[0].bet.ev) *
        (analyses[i].ev / analyses[i].decimalOdds),
    });
  }
  let total = 0;
  betAmounts.forEach((bet) => (total += bet.amount));
  betAmounts.forEach((bet) => (bet.amount *= bankroll / total));

  let out: string = '';
  betAmounts.forEach((analysis) => {
    if (!isNaN(analysis.bet.realProb)) {
      out +=
        [
          analysis.bet.team,
          analysis.bet.winTotal,
          analysis.bet.decimalOdds,
          analysis.bet.impliedProb,
          analysis.bet.sportsbook,
          analysis.bet.realProb,
          analysis.bet.ev,
          analysis.amount,
          analysis.amount * analysis.bet.decimalOdds,
        ].join(',') + '\n';
    }
  });
  return out;
}

export function calculateBettingResult(
  seasonSims: SeasonSimulationN,
  bets: ExactWinAnalysis[],
  bankroll: number
): { bankResults: number[]; numBetsWon: number[]; betAmountsForWonBets: number[]; betAmountsForLostBets: number[] } {
  let totalProb = 0;
  bets.forEach((bet) => (totalProb += bet.realProb));
  let betAmounts: { bet: ExactWinAnalysis; amount: number }[] = [];
  betAmounts.push({ bet: bets[0], amount: 5 });
  for (let i = 1; i < bets.length; i++) {
    betAmounts.push({
      bet: bets[i],
      amount: ((betAmounts[0].amount * betAmounts[0].bet.decimalOdds) / betAmounts[0].bet.ev) * bets[i].ev,
    });
  }
  let total = 0;
  betAmounts.forEach((bet) => (total += bet.amount));
  betAmounts.forEach((bet) => (bet.amount *= bankroll / total));

  let bankResults: number[] = [];
  let numBetsWon: number[] = [];
  let betAmountsForWonBets: number[] = [];
  let betAmountsForLostBets: number[] = [];
  let simCount = seasonSims[Object.keys(seasonSims)[0]].length;
  for (let simNum = 0; simNum < simCount; simNum++) {
    let bank = 0;
    let wonBets = 0;
    let odds: number[] = [];
    betAmounts.forEach((bet) => {
      if (seasonSims[bet.bet.team][simNum] == bet.bet.winTotal) {
        bank += bet.amount * bet.bet.decimalOdds;
        wonBets += 1;
        betAmountsForWonBets.push(bet.amount);
      } else {
        betAmountsForLostBets.push(bet.amount);
      }
    });
    bankResults.push(bank);
    numBetsWon.push(wonBets);
  }

  return {
    bankResults: bankResults,
    numBetsWon,
    betAmountsForWonBets,
    betAmountsForLostBets,
  };
}
