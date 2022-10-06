import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { MARKUP_TYPES, MESSAGES, SCENES_NAMES } from '../../../constants';
import { checkHasData, instanceOfType } from '../../../utils';
import {
	IGetPropertyFromStorage,
	ISavePropertyToStorage,
	IMoveNextScene,
	IBaseControllerProps,
	IHandlerAction,
	IHandlerCustomAction,
	IShowRepliesMarkupParams,
	IGenerateInlineButtons,
	GenerateInlineButtonsReturnType,
	ICreateOrEditProductAndShowParams,
	IBindActions,
} from './base-scene.interface';
import {
	IUsersRepository,
	UserFindReturn,
} from '../../../domains/users/users.repository.interface';
import { IActionController } from './base-scene.interface';
import { Message } from 'telegraf/src/core/types/typegram';

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	usersRepository: IUsersRepository;

	protected constructor({ scene, logger, usersRepository }: IBaseControllerProps) {
		this.scene = scene;
		this.logger = logger;
		this.usersRepository = usersRepository;

		this.bindActions([{ method: 'on', action: 'text', func: this.onAnswer }]);
	}

	async goToCart(ctx: IMyContext): Promise<void> {
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.CART,
		});
	}

	protected getPropertyFromStorage = ({
		ctx,
		property,
	}: IGetPropertyFromStorage): string | undefined => {
		try {
			const currentProperty = ctx.session[property];

			checkHasData({
				data: currentProperty,
				message: `[getPropertyFromStorage] Ошибка получения свойства ${property}`,
			});

			return currentProperty as string;
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(err);
			}
		}
	};

	protected savePropertyToStorage = <T extends string | number | object>({
		ctx,
		property,
	}: ISavePropertyToStorage<T>): void => {
		const [[key, value]] = Object.entries(property);

		if (<string>key) {
			ctx.session[key] = value as T;
		}
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

	async actionsController({ ctx, message }: IActionController): Promise<void> {
		switch (message) {
			case MESSAGES.MY_ORDERS: {
				await this.goToCart(ctx);
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

	protected async onAnswer(ctx: IMyContext): Promise<void> {
		if (ctx.message) {
			const message = 'text' in ctx.message && ctx.message.text;
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}

	getScene(): Scenes.BaseScene<IMyContext> {
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

	async createOrEditProductAndShow({
		ctx,
		mode,
		messageId,
		image,
		caption,
		buttonsGroup,
	}: ICreateOrEditProductAndShowParams): Promise<number | void> {
		let chatMessage: null | Message.PhotoMessage = null;

		if (ctx.chat?.id) {
			if (mode === 'create') {
				chatMessage = await ctx.telegram.sendPhoto(ctx.chat.id, image, {
					caption,
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: buttonsGroup,
					},
				});
			} else if (mode === 'edit' && messageId) {
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

			if (chatMessage) {
				return chatMessage.message_id;
			}
		}
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
