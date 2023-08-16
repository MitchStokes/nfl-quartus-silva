import { readFileSync } from 'fs';

export interface TeamOdds {
  [key: string]: {
    lowerBound: number;
    upperBound: number;
  }[];
}

export function parseOddsBounds(): TeamOdds {
  const content = readFileSync('./res/oddsBounds.json', 'utf8');
  const root = JSON.parse(content);
  let out: TeamOdds = {};

  Object.keys(root).forEach((teamName: string) => {
    const weeks = root[teamName];
    let teamOddsBounds: {
      lowerBound: number;
      upperBound: number;
    }[] = [];
    weeks.forEach((week: any) => {
      const lowerBound = week['lowerBound'];
      const upperBound = week['upperBound'];
      teamOddsBounds.push({ lowerBound, upperBound });
    });
    out[teamName] = teamOddsBounds;
  });

  return out;
}

function generateEveryWinLossCombo(): number[] {
  let out: number[] = [];
  for (let i = 0; i <= 131071; i++) {
    out.push(i);
  }
  return out;
}

// 0 based
function didWinIthGame(winLoss: number, i: number): boolean {
  return (winLoss >> i) % 2 == 1;
}

function getNumberOfWinsInCombo(winLoss: number): number {
  let wins = 0;
  for (let i = 0; i < 17; i++) {
    wins += didWinIthGame(winLoss, i) ? 1 : 0;
  }
  return wins;
}

export function findWorstCaseParlayOddsForTeam(teamName: string, oddsBounds: TeamOdds): { [key: number]: number } {
  let out: { [key: number]: number } = {};
  const allCombos = generateEveryWinLossCombo();
  allCombos.forEach((winLossCombo) => {
    if (getNumberOfWinsInCombo(winLossCombo) > 4) return;
    let parlayValue = 1;
    oddsBounds[teamName].forEach((week, idx) => {
      if (didWinIthGame(winLossCombo, idx)) {
        parlayValue *= week.upperBound;
      } else {
        parlayValue *= 1 / (1 - 1 / week.lowerBound);
      }
    });
    out[winLossCombo] = parlayValue;
  });
  return out;
}
