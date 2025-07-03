import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockService } from '../stock/stock.service';
import { RulesService } from '../stock/rules.service';
import { MarkdownService } from '../alerts/markdown.service';
import { NotifierService } from '../alerts/notifier.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly stock: StockService,
    private readonly rules: RulesService,
    private readonly markdown: MarkdownService,
    private readonly notifier: NotifierService,
  ) {}

  @Cron('0 */5 * * * *') // every 5 minutes
  async handleCron() {
    for (const ticker of this.stock.getTickers()) {
      const indicators = await this.stock.fetchIndicators(ticker);
      const triggers = this.rules.checkTriggers(ticker, indicators);
      if (triggers.length > 0) {
        const file = this.markdown.createMarkdown(ticker, indicators, triggers);
        const reason = triggers
          .map((t) => {
            const [k, v] = t.split(':');
            if (k === 'priceAbove') return `Price > $${v}`;
            if (k === 'rsiBelow') return `RSI < ${v}`;
            if (k === 'macdCross') return `MACD ${v}`;
            return t;
          })
          .join(' and ');
        const message = `\uD83D\uDCC8 ${ticker} Alert: ${reason}`;
        await this.notifier.pushAlert(file, message);
      }
    }
  }
}
