import { Scenes } from 'telegraf';
import { BaseController } from '../../../common/base.controller';
import { IMyContext } from '../../../common/common.interface';
import { ILogger } from '../../../logger/logger.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IProductsRepository } from '../../../products/products.repository.interface';
import { IBotService } from '../../bot.service.interface';

interface IStartSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	bot: IBotService;
	sceneNames: string[];
}

export class CatalogSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	bot: IBotService;
	sceneNames: string[];

	constructor({
		scene,
		logger,
		markupController,
		markup,
		productsRepository,
		bot,
		sceneNames,
	}: IStartSceneControllerProps) {
		super({ scene, logger, sceneNames });
		this.bot = bot;
		this.markupController = markupController;
		this.markup = markup;
		this.productsRepository = productsRepository;
		this.sceneNames = sceneNames;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', command: 'text', func: this.onAnswer },
		]);
	}

	public async start(ctx: IMyContext): Promise<void> {
		try {
			const currentStepName = this.getCurrentStepName(ctx);

			await this.showProduct(ctx);

			this.markupController.createMarkup(ctx, this.markup[currentStepName]());
		} catch (err) {
			this.logger.error(`[CatalogSceneController] ${err}`);
		}
	}

	private async showProduct(ctx: IMyContext): Promise<void> {
		const product = await this.productsRepository.getProduct();

		if (product) {
			const viewProduct = `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>\n\n${product.description}`;

			await this.bot.telegram.sendPhoto(ctx.chat?.id, product.image, {
				caption: viewProduct,
				parse_mode: 'html',
			});
		}
	}

	public async onAnswer(ctx: IMyContext): Promise<void> {
		ctx.reply('Нам пока не нужны эти данные. Спасибо.');
	}
}
