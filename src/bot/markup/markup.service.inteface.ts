import { ISceneInfo } from './markup.controller.interface';

export interface IMarkupSteps {
	[key: string]: () => ISceneInfo;
}

export interface IMarkup {
	[key: string]: any;
}

export interface IMarkupService {
	markup: () => IMarkup;
	getCurrentMarkup: (currentSceneName: string) => IMarkupSteps;
	getSceneNames: () => string[];
}
