import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ICatalogSceneControllerProps } from './catalog-scene.interface';

export class CatalogSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	sceneNames: string[];

	constructor({
		scene,
		logger,
		markupController,
		markup,
		productsRepository,
		sceneNames,
	}: ICatalogSceneControllerProps) {
		super({ scene, logger, sceneNames });
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

		if (product && ctx.chat?.id) {
			const viewProduct = `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>\n\n${product.description}`;

			await ctx.telegram.sendPhoto(ctx.chat.id, product.image, {
				caption: viewProduct,
				parse_mode: 'HTML',
			});
		}
	}

	public async onAnswer(ctx: IMyContext): Promise<void> {
		ctx.reply('Нам пока не нужны эти данные. Спасибо.');
	}
}
