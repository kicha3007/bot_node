import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { LoggerService } from "./logger/logger.service";

export class Bot {
  bot: Telegraf;
  logger: LoggerService;

  constructor(bot: Telegraf, logger: LoggerService) {
    this.bot = bot;
    this.logger = logger;
  }

  reply(res: string): void {
    this.bot.on('text', (ctx) => {
      ctx.reply(res);
    })
  }

  public async init() {
    this.bot.launch();
    this.logger.log('Бот инициализирован');
  }
}