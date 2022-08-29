import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import {
	ICatalogSceneControllerProps,
	IActionController,
	IGenerateProductTemplate,
	IShowProductWithNavigation,
	IGeneratePositionMessageParams,
} from './catalog-scene.interface';
import {
	getProductsReturn,
	IGetProductsParams,
	IProductsRepository,
} from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cartProduct/cartProduct.repository.interface';
import { MESSAGES, SCENES_NAMES, STEPS_NAMES, PROPERTY_STORAGE_NAMES } from '../../../constants';
import { Message } from 'telegraf/src/core/types/typegram';
import { CartProduct } from '../../../domains/cartProduct/cartProduct.entity';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export class CatalogSceneController extends BaseController {
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	itemsLength: number;
	usersRepository: IUsersRepository;

	constructor({
		scene,
		logger,
		markupController,
		markup,
		productsRepository,
		cartProductRepository,
		sceneNames,
		cartRepository,
		usersRepository,
	}: ICatalogSceneControllerProps) {
		super({ scene, logger, sceneNames, usersRepository });
		this.markupController = markupController;
		this.markup = markup;
		this.productsRepository = productsRepository;
		this.cartProductRepository = cartProductRepository;
		this.cartRepository = cartRepository;
		this.usersRepository = usersRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			/*{ method: 'on', action: 'text', func: this.onAnswer },*/
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
			/*{ method: 'on', action: 'callback_query', func: this.onAction },*/
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

				const productTemplate = this.generateProductTemplate({ product: firstProduct });

				this.itemsLength = products.length;
				const currentProductPosition = 1;

				const productPositionMessage = this.generatePositionMessage({
					currentPosition: currentProductPosition,
					itemsLength: this.itemsLength,
				});

				/*		const currentProductMessageId = this.getPropertyFromStorage({
					ctx,
					property: PROPERTY_STORAGE_NAMES.PRODUCT_MESSAGE_ID,
				});*/

				const productChatMessage = await this.showProductWithNavigation({
					ctx,
					countMessage: productPositionMessage,
					caption: productTemplate,
					image: firstProduct.image,
				});

				const productMessageId = String(productChatMessage?.message_id);
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

				await this.markupController.createMarkup(ctx, this.markup[STEPS_NAMES.SET_BUTTONS]());
			}
		} catch (err) {
			this.logger.error(`[CatalogSceneController] ${err}`);
		}
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
	}: IShowProductWithNavigation): Promise<Message.PhotoMessage | null> {
		const currentStepName = this.getCurrentStepName(ctx);

		let config = {};

		if (mode && messageId) {
			config = {
				countMessage,
				caption,
				image,
				mode,
				messageId,
			};
		} else {
			config = {
				countMessage,
				caption,
				image,
			};
		}

		return this.markupController.createMarkup(ctx, this.markup[currentStepName](config));
	}

	generateProductTemplate({ product }: IGenerateProductTemplate): string {
		return `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>`;
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
					const loopedNextProductPosition = this.loopNavigation({
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

						const productTemplate = this.generateProductTemplate({ product });

						const productPositionMessage = this.generatePositionMessage({
							currentPosition: loopedNextProductPosition,
							itemsLength: this.itemsLength,
						});

						const currentProductMessageId = this.getPropertyFromStorage({
							ctx,
							property: PROPERTY_STORAGE_NAMES.PRODUCT_MESSAGE_ID,
						});

						await this.showProductWithNavigation({
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

	/*	async actionsController({ ctx, message }: IActionController): Promise<void> {
		switch (message) {
			case MESSAGES.MY_ORDERS: {
				await ctx.deleteMessage();
				await this.goToCart(ctx);
				break; 
			}
			case MESSAGES.CATALOG: {
				await ctx.scene.reenter();
				break;
			}
			default:
				await ctx.reply('Нам пока не нужны эти данные. Спасибо.');
		}
	}*/

	public async onAnswer(ctx: IMyContext): Promise<void> {
		if (ctx.message) {
			// TODO Пока так решил проблему с типизацией text в message
			const message = 'text' in ctx.message && ctx.message.text;
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}

	/*	// TODO позже удалить
	async onAction(ctx: IMyContext): Promise<void> {
		ctx.reply('sfsdf');
		if (ctx.message) {
			const message = 'text' in ctx.message && ctx.message.text;
		}
	}*/

	async goToDetail(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.DETAIL,
		});
	}

	/*
	async goToCart(ctx: IMyContext): Promise<void> {
		console.log('goToCart');
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.CART,
		});
	}
*/

	async addToCart(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		const cart = user && (await this.cartRepository.getCart({ userId: user.id }));
		console.log('addToCart');
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
}
