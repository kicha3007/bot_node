import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import {
	ICatalogSceneControllerParams,
	IShowProductWithNavigation,
} from './catalog-scene.interface';
import {
	getProductsReturn,
	IGetProductsParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { SCENES_NAMES, STORAGE_PROPS } from '../../constants';
import { CartProduct } from '../../../domains/cart/cartProduct/cartProduct.entity';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { CatalogSceneTemplate } from './catalog-scene.template';
import { Scenes } from 'telegraf';
import { MESSAGES } from '../../constants';
import { loopNavigation } from '../../utils';

export class CatalogSceneController extends BaseController {
	private productsRepository: IProductsRepository;
	private cartProductRepository: ICartProductRepository;
	private cartRepository: ICartRepository;

	constructor(params: ICatalogSceneControllerParams) {
		const { logger, productsRepository, cartProductRepository, cartRepository, usersRepository } =
			params;
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.CATALOG);
		super({ scene, logger, usersRepository });
		this.productsRepository = productsRepository;
		this.cartProductRepository = cartProductRepository;
		this.cartRepository = cartRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{
				method: 'action',
				customAction: MESSAGES.NEXT,
				func: this.getSiblingProduct('next'),
			},
			{
				method: 'action',
				customAction: MESSAGES.PREV,
				func: this.getSiblingProduct('prev'),
			},
			{
				method: 'action',
				customAction: MESSAGES.DETAIL_DESCRIPTION,
				func: this.goToDetail,
			},
			{
				method: 'action',
				customAction: MESSAGES.ADD_TO_CART,
				func: this.addToCart,
			},
			{
				method: 'action',
				customAction: MESSAGES.COUNT_PRODUCT_IN_LIST,
				func: this.onClickCountProductInList,
			},
		]);
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			const products = await this.getProducts();
			const firstProduct = products[0];

			if (firstProduct) {
				this.savePropertyToStorage(ctx, {
					[STORAGE_PROPS.PRODUCT_ID]: firstProduct.id,
				});

				const productTemplate = CatalogSceneTemplate.getProductInfo({ product: firstProduct });

				this.savePropertyToStorage(ctx, {
					[STORAGE_PROPS.CATALOG_ITEMS_LENGTH]: products.length,
				});

				const currentProductPosition = 1;

				const itemsLength = this.getPropertyFromStorage(ctx, STORAGE_PROPS.CATALOG_ITEMS_LENGTH);

				if (!itemsLength) {
					return;
				}

				const productPositionMessage = CatalogSceneTemplate.getPositionMessage(
					currentProductPosition,
					itemsLength,
				);

				const productMessageId = await this.showProductAndGetMessageId({
					ctx,
					countMessage: productPositionMessage,
					caption: productTemplate,
					image: firstProduct.image,
				});

				if (productMessageId) {
					this.savePropertyToStorage(ctx, {
						[STORAGE_PROPS.PRODUCT_MESSAGE_ID]: productMessageId,
					});

					this.savePropertyToStorage(ctx, {
						[STORAGE_PROPS.PRODUCT_POSITION]: currentProductPosition,
					});
				}

				const buttons = CatalogSceneTemplate.getButtons();
				await ctx.reply(buttons.title, {
					reply_markup: {
						keyboard: buttons.items,
					},
				});
			}
		} catch (err) {
			this.logger.error(`[CatalogSceneController] ${err}`);
		}
	}

	private async showProductAndGetMessageId(
		params: IShowProductWithNavigation,
	): Promise<number | void> {
		const { ctx, countMessage, caption, image, mode = 'create', messageId } = params;

		const buttonsGroup = this.generateInlineButtons({
			items: CatalogSceneTemplate.getInlineButtons({ countMessage }),
		});

		if (mode === 'create') {
			const productMessageId = await this.createProductAndShow({
				ctx,
				image,
				caption,
				buttonsGroup,
			});
			return productMessageId;
		} else if (mode === 'edit' && messageId) {
			await this.editProductAndShow({
				ctx,
				messageId,
				image,
				caption,
				buttonsGroup,
			});
		}
		return;
	}

	private async getProducts({ take, skip }: IGetProductsParams = {}): Promise<getProductsReturn> {
		return this.productsRepository.getProducts({ take, skip });
	}

	private getSiblingProduct(direction: 'prev' | 'next'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			await ctx.answerCbQuery();

			const currentProductPosition = this.getPropertyFromStorage(
				ctx,
				STORAGE_PROPS.PRODUCT_POSITION,
			);

			if (currentProductPosition) {
				const step = 1;

				const nextProductPosition =
					direction === 'prev'
						? parseInt(currentProductPosition) - step
						: parseInt(currentProductPosition) + step;

				const itemsLength = this.getPropertyFromStorage(ctx, STORAGE_PROPS.CATALOG_ITEMS_LENGTH);

				if (!itemsLength) {
					return;
				}

				const loopedNextProductPosition = loopNavigation({
					nextPosition: nextProductPosition,
					itemsLength: parseInt(itemsLength),
				});

				const countForTake = 1;
				const countForNormalizePosition = 1;

				const products = await this.getProducts({
					take: countForTake,
					skip: loopedNextProductPosition - countForNormalizePosition,
				});

				const product = products[0];
				if (product) {
					this.savePropertyToStorage(ctx, { [STORAGE_PROPS.PRODUCT_ID]: product.id });

					const productTemplate = CatalogSceneTemplate.getProductInfo({ product });

					const productPositionMessage = CatalogSceneTemplate.getPositionMessage(
						loopedNextProductPosition,
						itemsLength,
					);

					const currentProductMessageId = this.getPropertyFromStorage(
						ctx,
						STORAGE_PROPS.PRODUCT_MESSAGE_ID,
					);

					await this.showProductAndGetMessageId({
						ctx,
						countMessage: productPositionMessage,
						caption: productTemplate,
						image: product.image,
						mode: 'edit',
						messageId: currentProductMessageId,
					});

					this.savePropertyToStorage(ctx, {
						[STORAGE_PROPS.PRODUCT_POSITION]: loopedNextProductPosition,
					});
				}
			}
		};
	}

	private async goToDetail(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.DETAIL,
		});
	}

	private async addToCart(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		const cart = user && (await this.cartRepository.getCart({ userId: user.id }));
		const productId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_ID);

		if (productId && cart) {
			const cartProduct = new CartProduct(cart.id, parseInt(productId));
			await this.cartProductRepository.add(cartProduct);
		}

		await ctx.answerCbQuery(MESSAGES.ADD_TO_CART_DONE);
	}

	private async onClickCountProductInList(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.COUNT_PRODUCT_IN_LIST);
	}
}
