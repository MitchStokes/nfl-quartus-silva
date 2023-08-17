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

export function exactWinAnalysesToCsv(analyses: ExactWinAnalysis[]): string {
  let out: string = '';
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

export function calculateBettingResult(
  seasonSims: SeasonSimulationN,
  bets: ExactWinAnalysis[],
  bankroll: number
): { bankResults: number[]; betAmountsForWonBets: number[]; betAmountsForLostBets: number[] } {
  let totalProb = 0;
  bets.forEach((bet) => (totalProb += bet.realProb));
  let betAmounts: { bet: ExactWinAnalysis; amount: number }[] = [];
  bets.forEach((bet) => betAmounts.push({ bet, amount: (bet.realProb * bankroll) / totalProb }));

  let results: number[] = [];
  let betAmountsForWonBets: number[] = [];
  let betAmountsForLostBets: number[] = [];
  let simCount = seasonSims[Object.keys(seasonSims)[0]].length;
  for (let simNum = 0; simNum < simCount; simNum++) {
    let bank = 0;
    let odds: number[] = [];
    betAmounts.forEach((bet) => {
      if (seasonSims[bet.bet.team][simNum] == bet.bet.winTotal) bank += bet.amount * bet.bet.decimalOdds;
      if (seasonSims[bet.bet.team][simNum] == bet.bet.winTotal) betAmountsForWonBets.push(bet.amount);
      if (seasonSims[bet.bet.team][simNum] != bet.bet.winTotal) betAmountsForLostBets.push(bet.amount);
    });
    results.push(bank);
  }

  return {
    bankResults: results,
    betAmountsForWonBets,
    betAmountsForLostBets,
  };
}
