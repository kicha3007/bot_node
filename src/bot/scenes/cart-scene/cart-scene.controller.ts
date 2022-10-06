import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import {
	ICatalogSceneControllerProps,
	IGeneratePositionMessageParams,
	IShowProductAndGetMessageId,
	IGenerateProductAmountParams,
	IShowProductInsideCartParams,
	IGenerateTotalAmountMessage,
} from './cart-scene.interface';
import {
	getProductReturn,
	IGetProductParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import {
	getCartProductsReturn,
	ICartProductRepository,
	IGetCartProductsParams,
} from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { MESSAGES, DEFAULT_CART_PRODUCT_POSITION, SCENES_NAMES } from '../../../constants';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { ProductModel } from '@prisma/client';
import { Scenes } from 'telegraf';
import { CartSceneTemplate } from './cart-scene.template';
import { loopNavigation } from '../../../utils';

export class CartSceneController extends BaseController {
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	cartProductsLength: number;
	usersRepository: IUsersRepository;
	productChatMessageId: number | undefined;
	productsRepository: IProductsRepository;
	currentCartProductPosition: number;
	currentProductId: number;
	currentProductCount: number;

	constructor({
		logger,
		cartProductRepository,
		cartRepository,
		usersRepository,
		productsRepository,
	}: ICatalogSceneControllerProps) {
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.CART);
		super({ scene, logger, usersRepository });
		this.cartProductRepository = cartProductRepository;
		this.cartRepository = cartRepository;
		this.usersRepository = usersRepository;
		this.productsRepository = productsRepository;

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
				customAction: MESSAGES.AMOUNT_TITLES,
				func: this.onClickAmountTitles,
			},
			{
				method: 'action',
				customAction: MESSAGES.CURRENT_PRODUCT_COUNT,
				func: this.onClickCurrentProductCount,
			},
			{
				method: 'action',
				customAction: MESSAGES.PRODUCT_SUM,
				func: this.onClickProductSum,
			},
			{
				method: 'action',
				customAction: MESSAGES.REMOVE_PRODUCT,
				func: this.removeProductAndUpdate,
			},
			{
				method: 'action',
				customAction: MESSAGES.INCREMENT_PRODUCT_COUNT,
				func: this.changeProductCount('inc'),
			},
			{
				method: 'action',
				customAction: MESSAGES.DECREMENT_PRODUCT_COUNT,
				func: this.changeProductCount('dec'),
			},
			{
				method: 'action',
				customAction: MESSAGES.TO_PAY,
				func: this.goToPay,
			},
		]);
	}

	generateProductAmount({ count, price }: IGenerateProductAmountParams): string {
		const result = count * price;

		return `${price} * ${count} = ${result}`;
	}

	async start(ctx: IMyContext): Promise<void> {
		await this.setCartProductsLength();

		try {
			if (this.isEmptyCar(this.cartProductsLength)) {
				await this.showEmptyCart(ctx);
			} else {
				await this.showProductInsideCart({ ctx, nextPosition: DEFAULT_CART_PRODUCT_POSITION });
			}
		} catch (err) {
			this.logger.error(`[CartSceneController] ${err}`);
		}
	}

	async setCartProductsLength(): Promise<void> {
		const cartProducts = await this.getCartProducts();
		this.cartProductsLength = cartProducts.length;
	}

	async getProduct({ id }: IGetProductParams = {}): getProductReturn {
		return this.productsRepository.getProduct({ id });
	}

	async getCartProducts({ take, skip }: IGetCartProductsParams = {}): getCartProductsReturn {
		return this.cartProductRepository.getProducts({ take, skip });
	}

	generatePositionMessage({
		currentPosition,
		itemsLength,
	}: IGeneratePositionMessageParams): string {
		return `${currentPosition} из ${itemsLength}`;
	}

	async getTotalAmount(): Promise<number> {
		const cartProducts = await this.getCartProducts();

		const productIdList = cartProducts.map(({ productId }) => productId);
		const products = await this.productsRepository.getProducts({
			where: {
				id: { in: productIdList },
			},
		});

		const totalAmount = (products as ProductModel[]).reduce((totalAmount, product) => {
			const currentCartProduct = cartProducts.find(({ productId }) => productId === product.id);

			const productQuantity = currentCartProduct?.productCount;
			const currentProductTotalAmount = (productQuantity || 0) * product.price;

			const productsTotalAmount = totalAmount + currentProductTotalAmount;
			return productsTotalAmount;
		}, 0);

		return totalAmount;
	}

	async generateTotalAmountMessage({ totalAmount }: IGenerateTotalAmountMessage): Promise<string> {
		return `Оформить - ${totalAmount} руб.`;
	}

	async showProductAndGetMessageId({
		ctx,
		countMessage,
		caption,
		image,
		mode = 'create',
		messageId,
		productSum,
		productCount,
		messagePay,
	}: IShowProductAndGetMessageId): Promise<number | void> {
		const buttonsGroup = this.generateInlineButtons({
			items: CartSceneTemplate.getInlineButtons({
				countMessage,
				productSum,
				productCount: String(productCount),
				messagePay,
			}),
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

	async showProductInsideCart({
		ctx,
		nextPosition,
		mode,
	}: IShowProductInsideCartParams): Promise<void> {
		const loopedNextProductPosition = loopNavigation({
			nextPosition,
			itemsLength: this.cartProductsLength,
		});

		const countForTake = 1;
		const countForNormalizePosition = 1;

		const cartProducts = await this.getCartProducts({
			take: countForTake,
			skip: loopedNextProductPosition - countForNormalizePosition,
		});

		const cartProduct = cartProducts[0];
		if (cartProduct?.productId) {
			const product = await this.getProduct({ id: cartProduct.productId });

			if (product) {
				this.currentProductId = product.id;
				this.currentProductCount = cartProduct.productCount;

				const productPositionMessage = this.generatePositionMessage({
					currentPosition: loopedNextProductPosition,
					itemsLength: this.cartProductsLength,
				});

				const productSum = this.generateProductAmount({
					price: product.price,
					count: this.currentProductCount,
				});

				const totalAmount = await this.getTotalAmount();
				const totalAmountMessage = await this.generateTotalAmountMessage({ totalAmount });

				const productMessageId = await this.showProductAndGetMessageId({
					ctx,
					countMessage: productPositionMessage,
					caption: CartSceneTemplate.getCartProductInfo({ product }),
					image: product.image,
					productSum,
					productCount: this.currentProductCount,
					messagePay: totalAmountMessage,
					mode,
					messageId: String(this.productChatMessageId),
				});

				if (productMessageId) {
					this.productChatMessageId = productMessageId;
				}

				this.currentCartProductPosition = loopedNextProductPosition;
			}
		}
	}

	getSiblingProduct(direction: 'prev' | 'next'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			if (this.cartProductsLength <= 1) {
				await ctx.answerCbQuery();
				return;
			}

			const step = 1;

			const nextCartProductPosition =
				direction === 'prev'
					? this.currentCartProductPosition - step
					: this.currentCartProductPosition + step;

			await this.showProductInsideCart({
				ctx,
				nextPosition: nextCartProductPosition,
				mode: 'edit',
			});

			await ctx.answerCbQuery();
		};
	}

	async onClickAmountTitles(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.AMOUNT_TITLES);
	}

	async onClickCurrentProductCount(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.CURRENT_PRODUCT_COUNT);
	}

	async onClickProductSum(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.PRODUCT_SUM);
	}

	async showEmptyCart(ctx: IMyContext): Promise<void> {
		this.showRepliesMarkup({
			ctx,
			replies: CartSceneTemplate.getEmptyCart(),
		});
	}

	isEmptyCar(cartProductsLength: number): boolean {
		return cartProductsLength === 0;
	}

	async removeProductAndUpdate(ctx: IMyContext): Promise<void> {
		await this.cartProductRepository.removeProduct({ productId: this.currentProductId });

		await this.setCartProductsLength();

		if (this.isEmptyCar(this.cartProductsLength)) {
			await ctx.deleteMessage(this.productChatMessageId);
			await this.showEmptyCart(ctx);
		} else {
			await this.showProductInsideCart({
				ctx,
				nextPosition: DEFAULT_CART_PRODUCT_POSITION,
				mode: 'edit',
			});
		}

		await ctx.answerCbQuery();
	}

	changeProductCount(action: 'inc' | 'dec'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			const stepCount = 1;

			const productCount =
				action === 'inc'
					? this.currentProductCount + stepCount
					: this.currentProductCount - stepCount;

			const minimumProductCount = 1;

			if (productCount >= minimumProductCount) {
				this.currentProductCount = productCount;

				await this.cartProductRepository.updateProduct({
					productId: this.currentProductId,
					productCount: this.currentProductCount,
				});

				await this.showProductInsideCart({
					ctx,
					nextPosition: this.currentCartProductPosition,
					mode: 'edit',
				});
			}

			await ctx.answerCbQuery();
		};
	}

	async goToPay(ctx: IMyContext): Promise<void> {
		// TODO доделать оплату
		await ctx.answerCbQuery('Тут должен быть переход на оплату');
	}
}
