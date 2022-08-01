import { Scenes } from 'telegraf';
import { BaseController } from '../../../common/base.controller';
import { IMyContext } from '../../../common/common.interface';
import { ILogger } from '../../../logger/logger.interface';

const storySteps = {
	introduction: {
		replies: [
			{ type: 'text', message: 'Привет! Меня зовут Кевин.\n Мне 7 лет, и я застрял один дома' },
			{ type: 'image', src: 'assets/sad-boy.png', message: 'следующие' },
		],
		buttons: [
			{ text: 'Как ты оказался один?', nextStep: 'parents-go-away' },
			{ text: 'А почему ты пишешь мне?', nextStep: 'found-you-contact' },
		],
	},
	'parents-go-away': {
		replies: [{ type: 'voice', src: 'assets/parents-forgot-me.wav', message: 'третий' }],
	},
	'found-you-contact': {
		replies: [
			{ type: 'text', message: 'Нашел твой номер в записной книжке.' },
			{ type: 'text', message: 'Мне больше некому писать (((' },
		],
	},
};

interface IStartSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
}

export class StartSceneController extends BaseController {
	// TODO временно any
	keyboards: any;

	constructor({ scene, logger }: IStartSceneControllerProps) {
		super({ scene, logger });

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', command: 'text', func: this.onAnswer },
			/*	{ method: 'update', command: 'text', func: this.reply },*/
		]);
	}

	protected getCurrentStepName(ctx: IMyContext): string {
		if (!ctx.session?.currentStepName) {
			ctx.session.currentStepName = 'introduction';
		}

		return ctx.session.currentStepName;
	}

	protected setNextStep(ctx: IMyContext, nextStep: string | null): void {
		if (ctx.session?.currentStepName) {
			ctx.session.currentStepName = nextStep;
		}
	}

	protected getNextSiblingStep(currentStepName: string): string | null {
		const stepsNames = Object.keys(storySteps);
		const currentStepIndex = stepsNames.findIndex((stepName) => stepName === currentStepName);

		const nextStepName = stepsNames[currentStepIndex + 1];

		return nextStepName ?? null;
	}

	public async start(ctx: IMyContext): Promise<void> {
		console.log('консоль стартовой сцены');
		try {
			const currentStepName = this.getCurrentStepName(ctx);
			console.log('currentStepName', currentStepName);
			// @ts-ignore
			const { replies, buttons } = storySteps[currentStepName];

			for (const replItem of replies) {
				console.log('replItem', replItem);
				await ctx.reply(replItem.message);
			}

			/*			await ctx.replyWithHTML(
				'Приветсвую в магазине гелевых шаров <b>GreenSharik </b>\n\n' +
					'Все самое лучшее у нас, покупай, поторапливайся!',
			);
			const city = await ctx.reply('Введите ваш город');*/
			/*		console.log('city', city);

			// Explicit usage
			ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

			// Using context shortcut
			ctx.answerCbQuery();

			const address = await ctx.reply('Введите ваш адрес');*/
		} catch (err) {
			this.logger.error(`[StartSceneController] ${err}`);
		}
	}

	public async onAnswer(ctx: IMyContext): Promise<void> {
		const cbQuery = ctx.update;
		console.log('cbQuery', cbQuery);

		/*		const currentStepName = await this.userSessionService.getUserStoryStep(userId);
		const { buttons, replies } = storySteps[currentStepName];*/

		/*		const userAnswer = 'data' in cbQuery ? cbQuery.data : null;*/

		console.log('curent_scene', this.scene);

		const nextStep = this.getNextSiblingStep(this.getCurrentStepName(ctx));

		this.setNextStep(ctx, nextStep);

		await ctx.scene.reenter();

		/*	await ctx.reply('Ответ из реплая');*/
	}
}
