import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { MARKUP_TYPES, SCENES_NAMES } from '../../constants';
import { checkHasData, instanceOfType } from '../../../utils';
import {
	IMoveNextScene,
	IBaseControllerParams,
	IHandlerAction,
	IHandlerCustomAction,
	IShowRepliesMarkupParams,
	IGenerateInlineButtons,
	GenerateInlineButtonsReturnType,
	IBindActions,
	IEditProduct,
	ICreateProduct,
} from './base-scene.interface';
import {
	IUsersRepository,
	UserFindReturn,
} from '../../../domains/users/users.repository.interface';
import { IActionController } from './base-scene.interface';
import { MESSAGES } from '../../constants';

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;
	protected logger: ILogger;
	protected usersRepository: IUsersRepository;

	protected constructor(params: IBaseControllerParams) {
		const { scene, logger, usersRepository } = params;

		this.scene = scene;
		this.logger = logger;
		if (usersRepository) {
			this.usersRepository = usersRepository;
		}

		this.bindActions([{ method: 'on', action: 'text', func: this.onAnswer }]);
	}

	protected getPropertyFromStorage = (ctx: IMyContext, property: string): string | undefined => {
		try {
			const currentProperty = ctx.session.mySession[property];

			checkHasData({
				data: currentProperty,
				message: `[getPropertyFromStorage] Ошибка получения свойства ${property}`,
			});

			return currentProperty;
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(err);
			}
		}
	};

	protected savePropertyToStorage = (
		ctx: IMyContext,
		property: Record<string, string | number>,
	): void => {
		const [[key, value]] = Object.entries(property);

		ctx.session.mySession[key] = String(value);
	};

	protected async moveNextScene({ ctx, nextSceneName }: IMoveNextScene): Promise<void> {
		ctx.scene.leave();
		await ctx.scene.enter(nextSceneName);
	}

	protected getCurrentUserInfo(ctx: IMyContext): { id: number; username: string } {
		return ctx.from as { id: number; username: string };
	}

	protected async getCurrentUser(ctx: IMyContext): UserFindReturn {
		const { id } = this.getCurrentUserInfo(ctx);

		return this.usersRepository.find({ id });
	}

	protected async actionsController({ ctx, message }: IActionController): Promise<void> {
		switch (message) {
			case MESSAGES.MY_ORDERS: {
				await this.moveNextScene({
					ctx,
					nextSceneName: SCENES_NAMES.CART,
				});
				break;
			}
			case MESSAGES.CATALOG: {
				await this.moveNextScene({
					ctx,
					nextSceneName: SCENES_NAMES.CATALOG,
				});

				break;
			}
			default:
				await ctx.reply('Нам пока не нужны эти данные. Спасибо.');
		}
	}

	protected getTextMessage(ctx: IMyContext): string {
		return ctx.message && 'text' in ctx.message ? ctx.message.text : '';
	}

	protected async onAnswer(ctx: IMyContext): Promise<void> {
		if (ctx.message) {
			const message = this.getTextMessage(ctx);
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}

	protected getScene(): Scenes.BaseScene<IMyContext> {
		return this.scene;
	}

	protected async showRepliesMarkup({
		ctx,
		replies,
		type = MARKUP_TYPES.HTML,
	}: IShowRepliesMarkupParams): Promise<void> {
		if (replies) {
			for (const repl of replies) {
				if (type === MARKUP_TYPES.HTML) {
					await ctx.replyWithHTML(repl.message);
				} else {
					await ctx.reply(repl.message);
				}
			}
		}
	}

	protected generateInlineButtons({
		items,
	}: IGenerateInlineButtons): GenerateInlineButtonsReturnType {
		return items.map((innerButtons) => {
			return innerButtons.map((button) => ({
				text: button.message,
				callback_data: button.callback,
			}));
		});
	}

	protected async createProduct(params: ICreateProduct): Promise<number> {
		if (!params.ctx.chat) {
			throw new Error('[createProduct] Ошибка создания продукта');
		}

		const chatMessage = await params.ctx.telegram.sendPhoto(params.ctx.chat.id, params.image, {
			caption: params.caption,
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: params.buttonsGroup,
			},
		});

		return chatMessage.message_id;
	}

	protected async editProduct(params: IEditProduct): Promise<void> {
		if (!params.ctx.chat) {
			throw new Error('[editProduct] Ошибка редактирования продукта');
		}

		await params.ctx.telegram.editMessageMedia(
			params.ctx.chat.id,
			parseInt(params.messageId),
			undefined,
			{
				type: 'photo',
				media: params.image,
				caption: params.caption,
				parse_mode: 'HTML',
			},
			{
				reply_markup: {
					inline_keyboard: params.buttonsGroup,
				},
			},
		);
	}

	protected bindActions(actions: Array<IBindActions>): void {
		for (const action of actions) {
			const handler = action.func.bind(this);
			if (instanceOfType<IHandlerAction>(action, 'action')) {
				this.scene[action.method](action.action, handler);
			} else if (instanceOfType<IHandlerCustomAction>(action, 'customAction')) {
				this.scene[action.method](action.customAction, handler);
			} else {
				this.scene[action.method](handler);
			}
		}
	}
}
