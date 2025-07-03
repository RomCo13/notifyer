import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { Injectable } from '@nestjs/common';
import * as path from 'path';

interface Indicators {
  price: number;
  rsi: number;
  macd: 'bullish' | 'bearish' | 'neutral';
}

@Injectable()
export class StockService {
  private tickers: string[] = [];
  private apiKey = process.env.ALPHA_VANTAGE_KEY;

  constructor() {
    const data = fs.readFileSync(path.join(__dirname, '../../config/tickers.yaml'), 'utf8');
    const parsed = yaml.parse(data);
    this.tickers = parsed.tickers || [];
  }

  getTickers(): string[] {
    return this.tickers;
  }

  async fetchIndicators(ticker: string): Promise<Indicators> {
    const prices = await this.fetchDailyPrices(ticker);
    const price = prices[prices.length - 1];
    const rsi = this.computeRSI(prices);
    const macd = this.computeMACD(prices);
    return {
      price,
      rsi,
      macd,
    };
  }

  private async fetchDailyPrices(ticker: string): Promise<number[]> {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${this.apiKey}`;
    const resp = await axios.get(url);
    const series = resp.data['Time Series (Daily)'];
    const closes = Object.keys(series)
      .sort()
      .map((date) => parseFloat(series[date]['4. close']));
    return closes.slice(-30); // last 30 days
  }

  private computeRSI(prices: number[]): number {
    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        gains.push(diff);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(diff));
      }
    }
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length || 1;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private computeMACD(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    const ema = (period: number): number[] => {
      const k = 2 / (period + 1);
      const emaArray: number[] = [];
      prices.forEach((price, index) => {
        if (index === 0) {
          emaArray.push(price);
        } else {
          emaArray.push(price * k + emaArray[index - 1] * (1 - k));
        }
      });
      return emaArray;
    };
    const ema12 = ema(12);
    const ema26 = ema(26);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = ema(9).slice(-macdLine.length);
    const hist = macdLine.map((val, i) => val - signalLine[i]);
    const last = hist[hist.length - 1];
    const prev = hist[hist.length - 2];
    if (prev < 0 && last > 0) return 'bullish';
    if (prev > 0 && last < 0) return 'bearish';
    return 'neutral';
  }
}
