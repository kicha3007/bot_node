import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IDetailSceneProps } from './detail-scene.interface';
import {
	getProductReturn,
	IGetProductParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { SCENES_NAMES, MESSAGES, PROPERTY_STORAGE_NAMES } from '../../../constants';
import {
	IGenerateProductTemplate,
	IShowProductWithNavigation,
} from '../catalog-scene/catalog-scene.interface';
import { Message } from 'telegraf/src/core/types/typegram';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export class DetailSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	sceneNames: string[];
	usersRepository: IUsersRepository;

	constructor({
		scene,
		logger,
		markupController,
		markup,
		productsRepository,
		sceneNames,
		usersRepository,
	}: IDetailSceneProps) {
		super({ scene, logger, sceneNames, usersRepository });
		this.markupController = markupController;
		this.markup = markup;
		this.productsRepository = productsRepository;
		this.sceneNames = sceneNames;
		this.usersRepository = usersRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{
				method: 'action',
				customAction: MESSAGES.BACK_TO_CATALOG,
				func: this.backToCatalog,
			},
		]);
	}

	async start(ctx: IMyContext): Promise<void> {
		try {
			const currentProductMessageId = this.getPropertyFromStorage({
				ctx,
				property: PROPERTY_STORAGE_NAMES.PRODUCT_MESSAGE_ID,
			});

			const currentProductId = this.getPropertyFromStorage({
				ctx,
				property: PROPERTY_STORAGE_NAMES.PRODUCT_ID,
			});

			if (currentProductId) {
				const product = await this.getProduct({ id: parseInt(currentProductId) });

				if (product) {
					const productTemplate = this.generateProductTemplate({ product });

					await this.showProductWithNavigation({
						ctx,
						caption: productTemplate,
						image: product.image,
						mode: 'edit',
						messageId: currentProductMessageId,
					});
				}
			}
		} catch (err) {
			this.logger.error(`[CatalogSceneController] ${err}`);
		}
	}

	async showProductWithNavigation({
		ctx,
		caption,
		image,
		mode,
		messageId,
	}: IShowProductWithNavigation): Promise<Message.PhotoMessage | null | void> {
		const currentStepName = this.getCurrentStepName(ctx);

		if (mode && messageId) {
			const config = {
				caption,
				image,
				mode,
				messageId,
			};

			return this.markupController.createMarkup(ctx, this.markup[currentStepName](config));
		}
	}

	generateProductTemplate({ product }: IGenerateProductTemplate): string {
		return `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>\n\n${product.description}`;
	}

	async getProduct({ id }: IGetProductParams = {}): Promise<getProductReturn> {
		return this.productsRepository.getProduct({ id });
	}

	async backToCatalog(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.CATALOG,
		});

		await ctx.answerCbQuery();
	}
}
