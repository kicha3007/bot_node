import { IMyContext } from '../common/common.interface';
import { Message } from 'telegraf/src/core/types/typegram';

interface ISceneInfoItem {
	message: string;
	nextStep?: string;
}

interface ISceneReplItem extends ISceneInfoItem {
	type: string;
}

interface ISceneButton extends ISceneInfoItem {
	callback: string;
}

interface IImageInlineButtons {
	title?: string;
	caption?: string;
	image?: string;
}

export type InlineButtonsMode = 'create' | 'edit';

export interface ISceneInfo {
	replies?: ISceneReplItem[];
	inlineButtons?: {
		info: IImageInlineButtons;
		items: ISceneButton[][];
		type: 'photo';
		messageId?: string;
		mode?: InlineButtonsMode;
		productSum?: string;
		messagePay?: string;
	};
	buttons?: {
		title: string;
		items: string[][];
	};
	nextScene?: {
		nextSceneName: string;
		nextStepName: string;
	};
}

export type CreateMarkupReturn = Promise<null | Message.PhotoMessage>;

export interface IMarkupController {
	createMarkup: (ctx: IMyContext, sceneInfo: ISceneInfo) => CreateMarkupReturn;
}
