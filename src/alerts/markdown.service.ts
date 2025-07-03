import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkdownService {
  createMarkdown(ticker: string, indicators: any, triggers: string[]): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `${ticker}_${dateStr}.md`;
    const content = `# ${ticker} Alert\n\n` +
      `**Price**: $${indicators.price.toFixed(2)}\n\n` +
      `**RSI**: ${indicators.rsi.toFixed(2)}\n\n` +
      `**MACD**: ${indicators.macd}\n\n` +
      `**Triggers**: ${triggers.join(', ')}\n\n` +
      `Timestamp: ${now.toISOString()}\n`;
    const dir = path.join(__dirname, '../../alerts');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }
}
