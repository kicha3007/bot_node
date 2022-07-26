import { Telegraf } from "telegraf";
import { Bot } from './bot';
import { LoggerService } from "./logger/logger.service";

const token = process.env.TOKEN;
if(!token) {
  throw new Error("Не задан token");
}

async function bootstrap() {
  const bot = new Bot(new Telegraf(token as string), new LoggerService());
  bot.init();
  bot.reply("Привет");
}

bootstrap();
