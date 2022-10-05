import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IDetailSceneProps, IShowDetailProduct } from './detail-scene.interface';
import {
	getProductReturn,
	IGetProductParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { SCENES_NAMES, MESSAGES, PROPERTY_STORAGE_NAMES } from '../../../constants';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { DetailSceneTemplate } from './detail-scene.template';
import { Scenes } from 'telegraf';

export class DetailSceneController extends BaseController {
	productsRepository: IProductsRepository;
	sceneNames: string[];
	usersRepository: IUsersRepository;

	constructor({ logger, productsRepository, sceneNames, usersRepository }: IDetailSceneProps) {
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.DETAIL);
		super({ scene, logger, usersRepository });
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

	async showDetailProduct({ ctx, caption, image, messageId }: IShowDetailProduct): Promise<void> {
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
