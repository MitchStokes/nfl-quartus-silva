import { readFileSync } from 'fs';

export interface FanduelExactWinLine {
  team: string;
  line: number;
  decimalOdds: number;
  impliedOdds: number;
}

export function parseFanduelExactWinLines(): FanduelExactWinLine[] {
  const content = readFileSync('./res/fanduelExactWinLines.csv', 'utf8');
  const lines = content.split('\r\n');

  let out: FanduelExactWinLine[] = [];
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
