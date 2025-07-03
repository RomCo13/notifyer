import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

export interface Rule {
  priceAbove?: number;
  rsiBelow?: number;
  macdCross?: 'bullish' | 'bearish';
}

@Injectable()
export class RulesService {
  private rules: Record<string, Rule> = {};

  constructor() {
    const p = path.join(__dirname, '../../rules/rules.json');
    const raw = fs.readFileSync(p, 'utf8');
    this.rules = JSON.parse(raw);
  }

  getRule(ticker: string): Rule | undefined {
    return this.rules[ticker];
  }

  checkTriggers(ticker: string, indicators: { price: number; rsi: number; macd: string; }): string[] {
    const rule = this.rules[ticker];
    if (!rule) return [];
    const triggers: string[] = [];
    if (rule.priceAbove !== undefined && indicators.price > rule.priceAbove) {
      triggers.push(`priceAbove:${rule.priceAbove}`);
    }
    if (rule.rsiBelow !== undefined && indicators.rsi < rule.rsiBelow) {
      triggers.push(`rsiBelow:${rule.rsiBelow}`);
    }
    if (rule.macdCross && rule.macdCross === indicators.macd) {
      triggers.push(`macdCross:${rule.macdCross}`);
    }
    return triggers;
  }
}
