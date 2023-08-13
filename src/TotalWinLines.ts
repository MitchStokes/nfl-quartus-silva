import { readFileSync } from 'fs';

enum LineType {
  OVER = 'OVER',
  UNDER = 'UNDER',
}

export interface TotalWinLine {
  team: string;
  type: LineType;
  line: number;
  oddsAmerican: number;
  oddsDecimal: number;
  impliedProb: number;
}

export function parseTotalWinLines(): TotalWinLine[] {
  const content = readFileSync('./res/totalWinLines.json', 'utf8');
  const root = JSON.parse(content);
  const teamsArray =
    root['eventGroup']['offerCategories'][2]['offerSubcategoryDescriptors'][0]['offerSubcategory']['offers'];
  let outputLines: TotalWinLine[] = [];

  teamsArray.forEach((entry: any) => {
    const object = entry[0];
    const team = object['label'].split(' Regular Season Wins')[0];

    const outcomes = object['outcomes'];
    outcomes.forEach((outcome: any) => {
      if (outcome['label'] != 'Over' && outcome['label'] != 'Under') return;
      const type: LineType = outcome['label'] == 'Over' ? LineType.OVER : LineType.UNDER;
      const line: number = parseFloat(outcome['line']);
      const oddsAmerican: number = parseInt(outcome['oddsAmerican']);
      const oddsDecimal: number = parseFloat(outcome['oddsDecimal']);
      const impliedProb: number = 1 / oddsDecimal;
      outputLines.push({
        team,
        type,
        line,
        oddsAmerican,
        oddsDecimal,
        impliedProb,
      });
    });
  });

  return outputLines;
}

interface TotalWinResult {
  line: TotalWinLine;
  n: number;
  successes: number;
  fails: number;
  ties: number;

  successRate: number;
  failRate: number;
  tieRate: number;

  ev: number;
}

export function testTotalWinLines(lines: TotalWinLine[], seasonResults: { [key: string]: number[] }): TotalWinResult[] {
  let outputResults: TotalWinResult[] = [];

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
      } else {
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

export const TOTAL_WIN_RESULT_HEADER =
  'team,type,line,american,decimal,impliedProb,n,successes,fails,ties,successRate,failRate,tieRate,ev';

export function totalWinResultToString(result: TotalWinResult): string {
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
