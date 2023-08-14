import { readFileSync } from 'fs';
import { Result } from './SeasonSim';

export interface ExactWinLine {
  team: string | undefined;
  eventId: string;
  line: number;
  oddsAmerican: number;
  oddsDecimal: number;
  impliedProb: number;
}

export function parseExactWinLines(): ExactWinLine[] {
  const content = readFileSync('./res/exactWinLines.json', 'utf8');
  const root = JSON.parse(content);
  const teamsArray =
    root['eventGroup']['offerCategories'][2]['offerSubcategoryDescriptors'][1]['offerSubcategory']['offers'];
  let outputLines: ExactWinLine[] = [];

  teamsArray.forEach((entry: any) => {
    const object = entry[0];
    const eventId = object['eventId'];

    const outcomes = object['outcomes'];
    outcomes.forEach((outcome: any) => {
      const line: number = parseInt(outcome['label']);
      const oddsAmerican: number = parseInt(outcome['oddsAmerican']);
      const oddsDecimal: number = parseFloat(outcome['oddsDecimal']);
      const impliedProb: number = 1 / oddsDecimal;
      outputLines.push({
        team: undefined,
        eventId,
        line,
        oddsAmerican,
        oddsDecimal,
        impliedProb,
      });
    });

    const eventsArray = root['eventGroup']['events'];
    let eventIdToTeamMap: { [key: string]: string } = {};
    eventsArray.forEach((event: any) => {
      const eventId = event['eventId'];
      const teamName = event['name'].split(' 2023/24')[0];
      eventIdToTeamMap[eventId] = teamName;
    });

    outputLines.forEach((outputLine) => {
      outputLine.team = eventIdToTeamMap[outputLine.eventId];
    });
  });

  return outputLines;
}

interface ExactWinResult extends Result<ExactWinLine> {
  line: ExactWinLine;
  n: number;
  successes: number;
  fails: number;

  successRate: number;
  failRate: number;

  ev: number;
}

export function testExactWinLines(lines: ExactWinLine[], seasonResults: { [key: string]: number[] }): ExactWinResult[] {
  let outputResults: ExactWinResult[] = [];

  lines.forEach((line) => {
    if (!line.team) return;

    const n = seasonResults[line.team].length;
    let successes = 0;
    let fails = 0;
    seasonResults[line.team].forEach((winCount) => {
      successes += winCount == line.line ? 1 : 0;
      fails += winCount != line.line ? 1 : 0;
    });

    const successRate = successes / n;
    const failRate = fails / n;
    const ev = successRate * (line.oddsDecimal - 1) - failRate;

    outputResults.push({
      line,
      n,
      successes,
      fails,
      successRate,
      failRate,
      ev,
    });
  });

  return outputResults;
}

export function exactWinResultToString(result: ExactWinResult): string {
  return [
    result.line.team,
    'EXACT',
    result.line.line,
    result.line.oddsAmerican,
    result.line.oddsDecimal,
    result.line.impliedProb,
    result.n,
    result.successes,
    result.fails,
    0,
    result.successRate,
    result.failRate,
    0,
    result.ev,
  ].join(',');
}
