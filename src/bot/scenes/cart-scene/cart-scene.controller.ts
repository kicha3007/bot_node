import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import {
	ICatalogSceneControllerProps,
	IGeneratePositionMessageParams,
	IGenerateProductTemplate,
	IShowProductWithNavigation,
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
} from '../../../domains/cartProduct/cartProduct.repository.interface';
import { MESSAGES, DEFAULT_CART_PRODUCT_POSITION } from '../../../constants';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { Message } from 'telegraf/src/core/types/typegram';
import { ProductModel } from '@prisma/client';

export class CartSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	cartProductsLength: number;
	usersRepository: IUsersRepository;
	productChatMessageId: number | undefined;
	productsRepository: IProductsRepository;
	currentCartProductPosition: number;
	currentProductId: number;

	constructor({
		scene,
		logger,
		markupController,
		markup,
		cartProductRepository,
		sceneNames,
		cartRepository,
		usersRepository,
		productsRepository,
	}: ICatalogSceneControllerProps) {
		super({ scene, logger, sceneNames, usersRepository });
		this.markupController = markupController;
		this.markup = markup;
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
				func: this.removeProduct,
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
			await this.showProductInsideCart({ ctx, nextPosition: DEFAULT_CART_PRODUCT_POSITION });
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

	generateProductTemplate({ product }: IGenerateProductTemplate): string {
		return `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>`;
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
			console.log('currentCartProduct', currentCartProduct);
			const productQuantity = currentCartProduct?.productCount;
			// TODO как тут лучше обрабатывать ошибку productQuantity === undefined?
			const currentProductTotalAmount = (productQuantity || 0) * product.price;

			const productsTotalAmount = totalAmount + currentProductTotalAmount;
			return productsTotalAmount;
		}, 0);

		return totalAmount;
	}

	async generateTotalAmountMessage({ totalAmount }: IGenerateTotalAmountMessage): Promise<string> {
		return `Оформить - ${totalAmount} руб.`;
	}

	async showProductWithNavigation({
		ctx,
		countMessage,
		caption,
		image,
		mode,
		messageId,
		productSum,
		productCount,
		messagePay,
	}: IShowProductWithNavigation): Promise<Message.PhotoMessage | null> {
		const currentStepName = this.getCurrentStepName(ctx);

		const baseConfig = {
			countMessage,
			caption,
			image,
			productSum,
			productCount,
			messagePay,
		};

		let config = {};

		if (mode && messageId) {
			config = {
				...baseConfig,
				mode,
				messageId,
			};
		} else {
			config = baseConfig;
		}

		return this.markupController.createMarkup(ctx, this.markup[currentStepName](config));
	}

	loopNavigation({
		nextPosition,
		itemsLength,
	}: {
		nextPosition: number;
		itemsLength: number;
	}): number {
		let currentPosition: number;

		if (nextPosition <= 0) {
			currentPosition = itemsLength;
		} else if (nextPosition > itemsLength) {
			currentPosition = 1;
		} else {
			currentPosition = nextPosition;
		}

		return currentPosition;
	}

	async showProductInsideCart({
		ctx,
		nextPosition,
		mode,
	}: IShowProductInsideCartParams): Promise<void> {
		const loopedNextProductPosition = this.loopNavigation({
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
			console.log('cartProduct?.id', cartProduct?.productId);
			const product = await this.getProduct({ id: cartProduct.productId });
			console.log('product', product);
			if (product) {
				this.currentProductId = product.id;
				const productTemplate = this.generateProductTemplate({ product });

				const productPositionMessage = this.generatePositionMessage({
					currentPosition: loopedNextProductPosition,
					itemsLength: this.cartProductsLength,
				});

				const productSum = this.generateProductAmount({
					price: product.price,
					count: cartProduct.productCount,
				});

				const totalAmount = await this.getTotalAmount();
				const totalAmountMessage = await this.generateTotalAmountMessage({ totalAmount });

				const productChatMessage = await this.showProductWithNavigation({
					ctx,
					countMessage: productPositionMessage,
					caption: productTemplate,
					image: product.image,
					productSum,
					productCount: cartProduct.productCount,
					messagePay: totalAmountMessage,
					mode,
					messageId: String(this.productChatMessageId),
				});

				if (!this.productChatMessageId) {
					this.productChatMessageId = productChatMessage?.message_id;
				}

				this.currentCartProductPosition = loopedNextProductPosition;
			}
		}
	}

	getSiblingProduct(direction: 'prev' | 'next'): (ctx: IMyContext) => Promise<void> {
		/*		const hasOneOrLessProducts = this.cartProductsLength === 1;
		if (hasOneOrLessProducts) {
			return;
		}*/

		return async (ctx: IMyContext): Promise<void> => {
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
		console.log('onClickAmountTitles');
		await ctx.answerCbQuery(MESSAGES.AMOUNT_TITLES);
	}

	async onClickCurrentProductCount(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.CURRENT_PRODUCT_COUNT);
	}

	async onClickProductSum(ctx: IMyContext): Promise<void> {
		await ctx.answerCbQuery(MESSAGES.PRODUCT_SUM);
	}

	async removeProduct(ctx: IMyContext): Promise<void> {
		await this.cartProductRepository.removeProduct({ productId: this.currentProductId });

		await this.setCartProductsLength();

		await this.showProductInsideCart({
			ctx,
			nextPosition: DEFAULT_CART_PRODUCT_POSITION,
			mode: 'edit',
		});
	}

	goToPay(ctx: IMyContext) {
		/*	await ctx.answerCbQuery();*/
	}

	/*	async actionsController({ ctx, message }: IActionController): Promise<void> {
    switch (message) {
      case MESSAGES.MY_ORDERS: {
        await ctx.deleteMessage();
        break;
      }
      case MESSAGES.CATALOG: {
        await ctx.scene.reenter();
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
      if (message) {
        await this.actionsController({ ctx, message });
      }
    }
  }*/
}
