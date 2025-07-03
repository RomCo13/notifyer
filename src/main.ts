import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StockService } from './stock/stock.service';
import { RulesService } from './stock/rules.service';
import { MarkdownService } from './alerts/markdown.service';
import { NotifierService } from './alerts/notifier.service';
import { TasksService } from './scheduler/tasks.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [StockService, RulesService, MarkdownService, NotifierService, TasksService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Scheduler will start automatically
}
bootstrap();
