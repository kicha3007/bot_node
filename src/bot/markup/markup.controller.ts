import { IMyContext } from '../../common/common.interface';
import { IMarkupController, ISceneInfo } from './markup.controller.interface';
import { MARKUP_TYPES } from '../../constants';

export class MarkupController implements IMarkupController {
	async createMarkup(ctx: IMyContext, sceneInfo: ISceneInfo): Promise<void> {
		const { replies, buttons, inlineButtons } = sceneInfo;

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
			const buttonsGroup = inlineButtons.items.map((innerButtons) => {
				return innerButtons.map((button) => ({
					text: button.message,
					callback_data: button.callback,
				}));
			});

			await ctx.reply(inlineButtons.title, {
				reply_markup: {
					inline_keyboard: buttonsGroup,
				},
			});
		}

		if (buttons) {
			await ctx.reply(buttons.title, {
				reply_markup: {
					keyboard: buttons.items,
				},
			});
		}
	}
}
