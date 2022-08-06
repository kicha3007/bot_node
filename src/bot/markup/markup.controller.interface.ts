import { IMyContext } from '../../common/common.interface';

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

export interface ISceneInfo {
	replies?: ISceneReplItem[];
	inlineButtons?: {
		title: string;
		items: ISceneButton[][];
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

export interface IMarkupController {
	createMarkup: (ctx: IMyContext, sceneInfo: ISceneInfo) => Promise<void>;
}
