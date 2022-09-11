import { IMyContext } from '../common/common.interface';
import {
	IMarkupController,
	ISceneInfo,
	type CreateMarkupReturn,
} from './markup.controller.interface';
import { MARKUP_TYPES } from '../../constants';
import { Message } from 'telegraf/src/core/types/typegram';

export class MarkupController implements IMarkupController {
	async createMarkup(ctx: IMyContext, sceneInfo: ISceneInfo): CreateMarkupReturn {
		const { replies, buttons, inlineButtons } = sceneInfo;

		let message: null | Message.PhotoMessage = null;

		if (replies) {
			for (const repl of replies) {
				if (repl.type === MARKUP_TYPES.HTML) {
					await ctx.replyWithHTML(repl.message);
				} else {
					await ctx.reply(repl.message);
				}
			}
		}

		if (inlineButtons) {
			const { type, info, mode, items, messageId } = inlineButtons;

			const buttonsGroup = items.map((innerButtons) => {
				return innerButtons.map((button) => ({
					text: button.message,
					callback_data: button.callback,
				}));
			});

			const { image, caption, title } = info;

			if (mode === 'create') {
				if (type === 'photo') {
					if (ctx.chat?.id && image) {
						message = await ctx.telegram.sendPhoto(ctx.chat.id, image, {
							caption,
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: buttonsGroup,
							},
						});
					}
				} else {
					if (title) {
						await ctx.reply(title, {
							reply_markup: {
								inline_keyboard: buttonsGroup,
							},
						});
					}
				}
			} else {
				if (type === 'photo') {
					if (ctx.chat?.id && image && messageId) {
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
			}
		}

		if (buttons) {
			await ctx.reply(buttons.title, {
				reply_markup: {
					keyboard: buttons.items,
				},
			});
		}

		return message;
	}
}
