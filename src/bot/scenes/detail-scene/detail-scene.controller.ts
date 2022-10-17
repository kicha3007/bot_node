import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IDetailSceneParams, IShowDetailProduct } from './detail-scene.interface';
import {
	getProductReturn,
	IGetProductParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { SCENES_NAMES, STORAGE_PROPS } from '../../constants';
import { DetailSceneTemplate } from './detail-scene.template';
import { Scenes } from 'telegraf';
import { MESSAGES } from '../../constants';

export class DetailSceneController extends BaseController {
	private productsRepository: IProductsRepository;

	constructor(params: IDetailSceneParams) {
		const { logger, productsRepository } = params;
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.DETAIL);
		super({ scene, logger });
		this.productsRepository = productsRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{
				method: 'action',
				customAction: MESSAGES.BACK_TO_CATALOG,
				func: this.backToCatalog,
			},
		]);
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			const currentProductMessageId = this.getPropertyFromStorage(
				ctx,
				STORAGE_PROPS.PRODUCT_MESSAGE_ID,
			);

			const currentProductId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_ID);

			if (currentProductId) {
				const product = await this.getProduct({ id: parseInt(currentProductId) });

				if (product) {
					await this.showDetailProduct({
						ctx,
						caption: DetailSceneTemplate.getDetailProductInfo({ product }),
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

	private async showDetailProduct({
		ctx,
		caption,
		image,
		messageId,
	}: IShowDetailProduct): Promise<void> {
		const buttonsGroup = this.generateInlineButtons({
			items: DetailSceneTemplate.getInlineButtons(),
		});

		if (ctx.chat?.id && messageId) {
			await ctx.telegram.editMessageMedia(
				ctx.chat.id,
				parseInt(messageId),
				undefined,
				{
					type: 'photo',
					media: image,
					caption,
					parse_mode: 'HTML',
				},
				{
					reply_markup: {
						inline_keyboard: buttonsGroup,
					},
				},
			);
		}
	}

	private async getProduct({ id }: IGetProductParams = {}): Promise<getProductReturn> {
		return this.productsRepository.getProduct({ id });
	}

	private async backToCatalog(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.CATALOG,
		});

		await ctx.answerCbQuery();
	}
}
