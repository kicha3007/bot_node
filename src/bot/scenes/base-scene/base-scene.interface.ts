import { IMyContext } from '../../common/common.interface';
import { Scenes } from 'telegraf';
import { ILogger } from '../../../infrastructure/logger/logger.interface';

export interface IHandler {
	method: 'enter' | 'leave';
	func: (ctx: IMyContext) => void;
}

export interface IHandlerCommand {
	method: 'on';
	command: 'text' | 'text'[];
	func: (ctx: IMyContext) => void;
}

export interface IBaseControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	sceneNames: string[];
}

export interface IGetNextSiblingStep {
	currentStepName: string;
	stepsNames: string[] | object;
	ctx: IMyContext;
}

export interface IMoveNextScene {
	ctx: IMyContext;
	nextSceneName: string;
}

export interface ISavePropertyToStorage {
	ctx: IMyContext;
	property: Record<string, string>;
}

export interface IGetPropertyFromStorage {
	ctx: IMyContext;
	property: string;
}
