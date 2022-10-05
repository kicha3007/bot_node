import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import {
	ICatalogSceneControllerProps,
	IShowProductWithNavigation,
	IGeneratePositionMessageParams,
} from './catalog-scene.interface';
import {
	getProductsReturn,
	IGetProductsParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { MESSAGES, SCENES_NAMES, PROPERTY_STORAGE_NAMES } from '../../../constants';
import { CartProduct } from '../../../domains/cart/cartProduct/cartProduct.entity';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { CatalogSceneTemplate } from './catalog-scene.template';
import { Scenes } from 'telegraf';
import { loopNavigation } from '../../../utils';

export class CatalogSceneController extends BaseController {
	productsRepository: IProductsRepository;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	itemsLength: number;
	usersRepository: IUsersRepository;

	constructor({
		logger,
		productsRepository,
		cartProductRepository,
		cartRepository,
		usersRepository,
	}: ICatalogSceneControllerProps) {
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.CATALOG);
		super({ scene, logger, usersRepository });
		this.productsRepository = productsRepository;
		this.cartProductRepository = cartProductRepository;
		this.cartRepository = cartRepository;
		this.usersRepository = usersRepository;

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

	async start(ctx: IMyContext): Promise<void> {
		try {
			const products = await this.getProducts();
			const firstProduct = products[0];

			if (firstProduct) {
				this.savePropertyToStorage<number>({
					ctx,
					property: { [PROPERTY_STORAGE_NAMES.PRODUCT_ID]: firstProduct.id },
				});

				const productTemplate = CatalogSceneTemplate.getProductInfo({ product: firstProduct });

				this.itemsLength = products.length;
				const currentProductPosition = 1;

				const productPositionMessage = this.generatePositionMessage({
					currentPosition: currentProductPosition,
					itemsLength: this.itemsLength,
				});

				const productMessageId = await this.showProductAndGetMessageId({
					ctx,
					countMessage: productPositionMessage,
					caption: productTemplate,
					image: firstProduct.image,
				});

				if (productMessageId) {
					this.savePropertyToStorage({
						ctx,
						property: { [PROPERTY_STORAGE_NAMES.PRODUCT_MESSAGE_ID]: productMessageId },
					});

					this.savePropertyToStorage<number>({
						ctx,
						property: { [PROPERTY_STORAGE_NAMES.PRODUCT_POSITION]: currentProductPosition },
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

	generatePositionMessage({
		currentPosition,
		itemsLength,
	}: IGeneratePositionMessageParams): string {
		return `${currentPosition} из ${itemsLength}`;
	}

	async showProductAndGetMessageId({
		ctx,
		countMessage,
		caption,
		image,
		mode = 'create',
		messageId,
	}: IShowProductWithNavigation): Promise<number | void> {
		const buttonsGroup = this.generateInlineButtons({
			items: CatalogSceneTemplate.getInlineButtons({ countMessage }),
		});

		const productMessageId = this.createOrEditProductAndShow({
			ctx,
			mode,
			messageId,
			image,
			caption,
			buttonsGroup,
		});

		if (productMessageId) {
			return productMessageId;
		}
	}

	async getProducts({ take, skip }: IGetProductsParams = {}): Promise<getProductsReturn> {
		return this.productsRepository.getProducts({ take, skip });
	}

	getSiblingProduct(direction: 'prev' | 'next'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			await ctx.answerCbQuery();

			const currentProductPosition = this.getPropertyFromStorage({
				ctx,
				property: PROPERTY_STORAGE_NAMES.PRODUCT_POSITION,
			});

			if (currentProductPosition) {
				const step = 1;

				const nextProductPosition =
					direction === 'prev'
						? parseInt(currentProductPosition) - step
						: parseInt(currentProductPosition) + step;

				if (this.itemsLength) {
					const loopedNextProductPosition = loopNavigation({
						nextPosition: nextProductPosition,
						itemsLength: this.itemsLength,
					});

					const countForTake = 1;
					const countForNormalizePosition = 1;

					const products = await this.getProducts({
						take: countForTake,
						skip: loopedNextProductPosition - countForNormalizePosition,
					});

					const product = products[0];
					if (product) {
						this.savePropertyToStorage<number>({
							ctx,
							property: { [PROPERTY_STORAGE_NAMES.PRODUCT_ID]: product.id },
						});

						const productTemplate = CatalogSceneTemplate.getProductInfo({ product });

						const productPositionMessage = this.generatePositionMessage({
							currentPosition: loopedNextProductPosition,
							itemsLength: this.itemsLength,
						});

						const currentProductMessageId = this.getPropertyFromStorage({
							ctx,
							property: PROPERTY_STORAGE_NAMES.PRODUCT_MESSAGE_ID,
						});

						await this.showProductAndGetMessageId({
							ctx,
							countMessage: productPositionMessage,
							caption: productTemplate,
							image: product.image,
							mode: 'edit',
							messageId: currentProductMessageId,
						});

						this.savePropertyToStorage<number>({
							ctx,
							property: { [PROPERTY_STORAGE_NAMES.PRODUCT_POSITION]: loopedNextProductPosition },
						});
					}
				}
			}
		};
	}

	public async onAnswer(ctx: IMyContext): Promise<void> {
		if (ctx.message) {
			const message = 'text' in ctx.message && ctx.message.text;
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}

	async goToDetail(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.DETAIL,
		});
	}

	async addToCart(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		const cart = user && (await this.cartRepository.getCart({ userId: user.id }));
		const productId = this.getPropertyFromStorage({
			ctx,
			property: PROPERTY_STORAGE_NAMES.PRODUCT_ID,
		});

		if (productId && cart) {
			const cartProduct = new CartProduct(cart.id, parseInt(productId));
			await this.cartProductRepository.add(cartProduct);
		}

		await ctx.answerCbQuery(MESSAGES.ADD_TO_CART_DONE);
	}

	async onClickCountProductInList(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.COUNT_PRODUCT_IN_LIST);
	}
}
