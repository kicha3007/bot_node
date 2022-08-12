import { ISceneInfo } from './markup.controller.interface';

export interface IMarkupSteps {
	[key: string]: () => ISceneInfo;
}

export type Markup = Record<string, IMarkupSteps>;

export interface IMarkupService {
	markup: () => Markup;
	getCurrentMarkup: (currentSceneName: string) => IMarkupSteps;
	getSceneNames: () => string[];
}
