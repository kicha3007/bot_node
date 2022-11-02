import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import {
	ICatalogSceneControllerParams,
	IShowCreatedCartProductAndGetMessageId,
	IShowEditedCartProduct,
	IShowProductInsideCartParams,
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
import { DEFAULT_CART_PRODUCT_POSITION, SCENES_NAMES, STORAGE_PROPS } from '../../constants';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { Scenes } from 'telegraf';
import { CartSceneTemplate } from './cart-scene.template';
import { MESSAGES } from '../../constants';
import { loopNavigation } from '../../utils';
import { BaseSceneTemplate } from '../base-scene/base-scene.template';
import { CartProductModel } from '@prisma/client';

export class CartSceneController extends BaseController {
	private cartProductRepository: ICartProductRepository;
	private cartRepository: ICartRepository;
	private productsRepository: IProductsRepository;

	constructor(params: ICatalogSceneControllerParams) {
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.CART);
		super({ scene, logger: params.logger });
		this.cartProductRepository = params.cartProductRepository;
		this.cartRepository = params.cartRepository;
		this.productsRepository = params.productsRepository;

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

	private async setCartProductsLength(ctx: IMyContext): Promise<void> {
		const cartProducts = await this.getCartProducts();

		this.savePropertyToStorage(ctx, {
			[STORAGE_PROPS.CART_PRODUCTS_LENGTH]: cartProducts.length,
		});
	}

	private async start(ctx: IMyContext): Promise<void> {
		await this.setCartProductsLength(ctx);

		const cartProductsLength = this.getPropertyFromStorage(ctx, STORAGE_PROPS.CART_PRODUCTS_LENGTH);
		if (!cartProductsLength) {
			return;
		}

		try {
			this.isEmptyCar(parseInt(cartProductsLength))
				? await this.showEmptyCart(ctx)
				: await this.showProductInsideCart({ ctx });
		} catch (err) {
			this.logger.error(`[CartSceneController] ${err}`);
		}
	}

	private async getProduct({ id }: IGetProductParams = {}): getProductReturn {
		return this.productsRepository.getProduct({ id });
	}

	private async getCartProducts({
		take,
		skip,
	}: IGetCartProductsParams = {}): getCartProductsReturn {
		return this.cartProductRepository.getProducts({ take, skip });
	}

	private async getTotalAmount(): Promise<number> {
		const cartProducts = await this.getCartProducts();

		const cartProductIds = cartProducts.map(({ productId }) => productId);
		const products = await this.productsRepository.getProducts({
			where: {
				id: { in: cartProductIds },
			},
		});

		const cartProductDictionary = cartProducts.reduce(
			(acc: Record<number, CartProductModel>, product: CartProductModel) => {
				acc[product.productId] = product;
				return acc;
			},
			{},
		);

		const totalAmount = products.reduce((totalAmount, product) => {
			const currentCartProduct = cartProductDictionary[product.id];

			const productQuantity = currentCartProduct?.productCount ?? 0;
			const currentProductTotalAmount = productQuantity * product.price;

			const productsTotalAmount = totalAmount + currentProductTotalAmount;
			return productsTotalAmount;
		}, 0);

		return totalAmount;
	}

	private async showEditedCartProduct(params: IShowEditedCartProduct): Promise<void> {
		const { ctx, countMessage, caption, image, messageId, productSum, messagePay, productCount } =
			params;

		const buttonsGroup = this.generateInlineButtons({
			items: CartSceneTemplate.getInlineButtons({
				countMessage,
				productSum,
				productCount: String(productCount),
				messagePay,
			}),
		});

		await this.editProduct({
			ctx,
			messageId,
			image,
			caption,
			buttonsGroup,
		});
	}

	private async showCreatedCartProductAndGetMessageId(
		params: IShowCreatedCartProductAndGetMessageId,
	): Promise<number> {
		const { ctx, countMessage, caption, image, productSum, productCount, messagePay } = params;

		const buttonsGroup = this.generateInlineButtons({
			items: CartSceneTemplate.getInlineButtons({
				countMessage,
				productSum,
				productCount: String(productCount),
				messagePay,
			}),
		});

		const productMessageId = await this.createProduct({
			ctx,
			image,
			caption,
			buttonsGroup,
		});

		return productMessageId;
	}

	private async showProductInsideCart({
		ctx,
		nextPosition = DEFAULT_CART_PRODUCT_POSITION,
		mode,
	}: IShowProductInsideCartParams): Promise<void> {
		const cartProductsLength = this.getPropertyFromStorage(ctx, STORAGE_PROPS.CART_PRODUCTS_LENGTH);

		if (!cartProductsLength) {
			return;
		}

		const loopedNextProductPosition = loopNavigation({
			nextPosition,
			itemsLength: parseInt(cartProductsLength),
		});

		const countForTake = 1;
		const countForNormalizePosition = 1;

		const cartProducts = await this.getCartProducts({
			take: countForTake,
			skip: loopedNextProductPosition - countForNormalizePosition,
		});

		const cartProduct = cartProducts[0];
		if (!cartProduct) {
			return;
		}

		const product = await this.getProduct({ id: cartProduct.productId });
		if (!product) {
			return;
		}

		this.savePropertyToStorage(ctx, { [STORAGE_PROPS.PRODUCT_ID]: product.id });
		this.savePropertyToStorage(ctx, {
			[STORAGE_PROPS.PRODUCT_COUNT]: cartProduct.productCount,
		});

		const productPositionMessage = BaseSceneTemplate.getPositionMessage(
			loopedNextProductPosition,
			cartProductsLength,
		);

		const productSum = CartSceneTemplate.getProductAmountMessage({
			price: product.price,
			count: cartProduct.productCount,
		});

		const totalAmount = await this.getTotalAmount();
		const totalAmountMessage = CartSceneTemplate.getTotalAmountMessage({ totalAmount });

		const productChatMessageId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_MESSAGE_ID);

		if (mode === 'edit') {
			await this.showEditedCartProduct({
				ctx,
				countMessage: productPositionMessage,
				caption: CartSceneTemplate.getCartProductInfo({ product }),
				image: product.image,
				productSum,
				productCount: cartProduct.productCount,
				messagePay: totalAmountMessage,
				messageId: String(productChatMessageId),
			});
		} else {
			const productMessageId = await this.showCreatedCartProductAndGetMessageId({
				ctx,
				countMessage: productPositionMessage,
				caption: CartSceneTemplate.getCartProductInfo({ product }),
				image: product.image,
				productSum,
				productCount: cartProduct.productCount,
				messagePay: totalAmountMessage,
				messageId: String(productChatMessageId),
			});

			if (!productMessageId) {
				return;
			}
			this.savePropertyToStorage(ctx, {
				[STORAGE_PROPS.PRODUCT_MESSAGE_ID]: String(productMessageId),
			});
		}

		this.savePropertyToStorage(ctx, {
			[STORAGE_PROPS.CART_PRODUCT_POSITION]: loopedNextProductPosition,
		});
	}

	private getSiblingProduct(direction: 'prev' | 'next'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			const cartProductsLength = this.getPropertyFromStorage(
				ctx,
				STORAGE_PROPS.CART_PRODUCTS_LENGTH,
			);

			const cartProductPosition = this.getPropertyFromStorage(
				ctx,
				STORAGE_PROPS.CART_PRODUCT_POSITION,
			);

			if (!(cartProductsLength && cartProductPosition)) {
				return;
			}

			const isOneProductInCart = parseInt(cartProductsLength) <= 1;
			if (isOneProductInCart) {
				await ctx.answerCbQuery();
				return;
			}

			const step = 1;
			const nextCartProductPosition =
				direction === 'prev'
					? parseInt(cartProductPosition) - step
					: parseInt(cartProductPosition) + step;

			await this.showProductInsideCart({
				ctx,
				nextPosition: nextCartProductPosition,
				mode: 'edit',
			});

			await ctx.answerCbQuery();
		};
	}

	private async onClickAmountTitles(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.AMOUNT_TITLES);
	}

	private async onClickCurrentProductCount(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.CURRENT_PRODUCT_COUNT);
	}

	private async onClickProductSum(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.PRODUCT_SUM);
	}

	private async showEmptyCart(ctx: IMyContext): Promise<void> {
		await this.showRepliesMarkup({
			ctx,
			replies: CartSceneTemplate.getEmptyCart(),
		});
	}

	isEmptyCar(cartProductsLength: number): boolean {
		return cartProductsLength === 0;
	}

	private async removeProductAndUpdate(ctx: IMyContext): Promise<void> {
		const cartProductsLength = this.getPropertyFromStorage(ctx, STORAGE_PROPS.CART_PRODUCTS_LENGTH);
		const productId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_ID);
		const productMessageId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_MESSAGE_ID);

		if (!(cartProductsLength && productId && productMessageId)) {
			return;
		}

		await this.cartProductRepository.removeProduct({ productId: parseInt(productId) });

		await this.setCartProductsLength(ctx);

		if (this.isEmptyCar(parseInt(cartProductsLength))) {
			await ctx.deleteMessage(parseInt(productMessageId));
			await this.showEmptyCart(ctx);
		} else {
			await this.showProductInsideCart({
				ctx,
				mode: 'edit',
			});
		}

		await ctx.answerCbQuery();
	}

	private changeProductCount(action: 'inc' | 'dec'): (ctx: IMyContext) => Promise<void> {
		return async (ctx: IMyContext): Promise<void> => {
			const currentProductCount = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_COUNT);
			const cartProductPosition = this.getPropertyFromStorage(
				ctx,
				STORAGE_PROPS.CART_PRODUCT_POSITION,
			);
			const productId = this.getPropertyFromStorage(ctx, STORAGE_PROPS.PRODUCT_ID);

			if (!(currentProductCount && productId && cartProductPosition)) {
				return;
			}

			const stepCount = 1;

			const productCount =
				action === 'inc'
					? parseInt(currentProductCount) + stepCount
					: parseInt(currentProductCount) - stepCount;

			const minimumProductCount = 1;

			if (productCount >= minimumProductCount) {
				this.savePropertyToStorage(ctx, { [STORAGE_PROPS.PRODUCT_COUNT]: productCount });

				await this.cartProductRepository.updateProduct({
					productId: parseInt(productId),
					productCount: productCount,
				});

				await this.showProductInsideCart({
					ctx,
					nextPosition: parseInt(cartProductPosition),
					mode: 'edit',
				});
			}

			await ctx.answerCbQuery();
		};
	}

	private async goToPay(ctx: IMyContext): Promise<void> {
		// TODO доделать оплату
		await ctx.answerCbQuery('Тут должен быть переход на оплату');
	}
}
