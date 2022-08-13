import { Scenes } from 'telegraf';
import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import {
	IProductsRepository,
	IGetProductsParams,
} from '../../../domains/products/products.repository.interface';
import { ProductModel } from '@prisma/client';
import { MESSAGES } from '../../../constants';

interface IStartSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	sceneNames: string[];
}

interface IGenerateProductTemplate {
	product: ProductModel;
}

interface IGetProduct extends IGetProductsParams {
	ctx: IMyContext;
}

interface IActionController {
	ctx: IMyContext;
	message: string;
}

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
	}: IStartSceneControllerProps) {
		super({ scene, logger, sceneNames });
		this.markupController = markupController;
		this.markup = markup;
		this.productsRepository = productsRepository;
		this.sceneNames = sceneNames;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', action: 'text', func: this.onAnswer },
		]);
	}

	public async start(ctx: IMyContext): Promise<void> {
		try {
			const currentStepName = this.getCurrentStepName(ctx);

			await this.getProduct({ ctx });

			const productMessageId = ctx.message?.message_id;
			if (productMessageId) {
				this.savePropertyToStorage({
					ctx,
					property: { productMessageId: productMessageId as number },
				});
			}

			this.markupController.createMarkup(ctx, this.markup[currentStepName]());
		} catch (err) {
			this.logger.error(`[CatalogSceneController] ${err}`);
		}
	}

	private async getNextProduct(ctx: IMyContext): Promise<void> {
		console.log('getNextProduct');
		ctx.reply('getNextProduct');
		await this.getProduct({ ctx, take: 1, skip: 2 });
	}

	generateProductTemplate({ product }: IGenerateProductTemplate): string {
		return `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>\n\n${product.description}`;
	}

	private async getProduct({ ctx, take, skip }: IGetProduct): Promise<void> {
		const products = await this.productsRepository.getProducts({ take, skip });
		const firstProduct = products[0];

		console.log('firstProduct', firstProduct);

		if (firstProduct && ctx.chat?.id) {
			const viewProduct = this.generateProductTemplate({ product: firstProduct });

			await ctx.telegram.sendPhoto(ctx.chat.id, firstProduct.image, {
				caption: viewProduct,
				parse_mode: 'HTML',
			});
		}
	}

	async actionsController({ ctx, message }: IActionController): Promise<void> {
		switch (message) {
			case MESSAGES.MY_ORDERS: {
				await this.getNextProduct(ctx);
				break;
			}
			default:
				await ctx.reply('Нам пока не нужны эти данные. Спасибо.');
		}
	}

	public async onAnswer(ctx: IMyContext): Promise<void> {
		if (ctx.message) {
			// TODO Пока так решил проблему с типизацией text в message
			const message = 'text' in ctx.message && ctx.message.text;
			console.log('message', message);
			console.log('ctx', ctx);
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}
}
