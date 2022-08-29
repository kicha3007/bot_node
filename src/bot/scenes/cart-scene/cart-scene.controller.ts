import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import {
	ICatalogSceneControllerProps,
	IGeneratePositionMessageParams,
	IGenerateProductTemplate,
	IShowProductWithNavigation,
	IGenerateProductSumParams,
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
import { MESSAGES, STEPS_NAMES, PROPERTY_STORAGE_NAMES } from '../../../constants';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { Message } from 'telegraf/src/core/types/typegram';

export class CartSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	cartProductsLength: number;
	usersRepository: IUsersRepository;
	productChatMessageId: number | undefined;
	productsRepository: IProductsRepository;

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
		]);
	}

	generateProductSum({ count, price }: IGenerateProductSumParams): string {
		const result = count * price;

		return `${price} * ${count} = ${result}`;
	}

	async start(ctx: IMyContext): Promise<void> {
		try {
			const cartProducts = await this.getCartProducts();
			const firstCartProduct = cartProducts[0];

			if (firstCartProduct && firstCartProduct.id) {
				const product = await this.getProduct({ id: firstCartProduct.id });

				if (product) {
					const productTemplate = this.generateProductTemplate({ product });

					this.cartProductsLength = cartProducts.length;
					const currentProductPosition = 1;

					const productPositionMessage = this.generatePositionMessage({
						currentPosition: currentProductPosition,
						itemsLength: this.cartProductsLength,
					});

					const productSum = this.generateProductSum({
						price: product.price,
						count: firstCartProduct.productCount,
					});

					const productChatMessage = await this.showProductWithNavigation({
						ctx,
						countMessage: productPositionMessage,
						caption: productTemplate,
						image: product.image,
						productSum,
						productCount: firstCartProduct.productCount,
						messagePay: 'Оплааатить',
					});

					this.productChatMessageId = productChatMessage?.message_id;

					await this.markupController.createMarkup(ctx, this.markup[STEPS_NAMES.BASE_STEP]());
				}
			}
		} catch (err) {
			this.logger.error(`[CartSceneController] ${err}`);
		}
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

				if (this.cartProductsLength) {
					const loopedNextProductPosition = this.loopNavigation({
						nextPosition: nextProductPosition,
						itemsLength: this.cartProductsLength,
					});

					const countForTake = 1;
					const countForNormalizePosition = 1;

					const products = await this.getCartProducts({
						take: countForTake,
						skip: loopedNextProductPosition - countForNormalizePosition,
					});

					const product = products[0];
					if (product) {
						this.savePropertyToStorage<number>({
							ctx,
							property: { [PROPERTY_STORAGE_NAMES.PRODUCT_ID]: product.id },
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

	/*








  async actionsController({ ctx, message }: IActionController): Promise<void> {
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
  }

  /!*	// TODO позже удалить
  async onAction(ctx: IMyContext): Promise<void> {
    ctx.reply('sfsdf');
    if (ctx.message) {
      const message = 'text' in ctx.message && ctx.message.text;
    }
  }*!/

  async goToDetail(ctx: IMyContext): Promise<void> {
    await this.moveNextScene({
      ctx,
      nextSceneName: SCENES_NAMES.DETAIL,
    });
  }
*/
}
