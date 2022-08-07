import { ISceneInfo } from './markup.controller.interface';

export interface IMarkupSteps {
	[key: string]: () => ISceneInfo;
}

export interface IMarkup {
	[key: string]: IMarkupSteps;
}

export interface IMarkupService {
	markup: () => IMarkup;
	getCurrentMarkup: (currentSceneName: string) => IMarkupSteps;
	getSceneNames: () => string[];
}
