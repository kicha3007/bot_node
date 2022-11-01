import { IMyContext } from '../../common/common.interface';
import { Scenes } from 'telegraf';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { MARKUP_TYPES } from '../../constants';
import { ProductModel } from '@prisma/client';

export interface IHandlerBase {
	method: 'enter' | 'leave';
	func: (ctx: IMyContext) => void;
}

export interface IHandlerAction {
	method: 'on';
	action: 'text' | 'text'[] | 'callback_query' | 'callback_query'[];
	func: (ctx: IMyContext) => void;
}

export interface IHandlerCustomAction {
	method: 'action';
	customAction: string;
	func: (ctx: IMyContext) => void | Promise<void>;
}

export interface IBaseControllerParams {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	usersRepository?: IUsersRepository;
}

export interface IMoveNextScene {
	ctx: IMyContext;
	nextSceneName: string;
}

export interface IActionController {
	ctx: IMyContext;
	message: string;
}

export interface ISceneReplItem {
	message: string;
}

export interface IInlineButton {
	message: string;
	callback: string;
}

export interface IShowRepliesMarkupParams {
	ctx: IMyContext;
	replies: ISceneReplItem[];
	type?: MARKUP_TYPES.TEXT | MARKUP_TYPES.HTML;
}

export interface IGetProductInfoParams {
	product: ProductModel;
}

export interface IButtons {
	title: string;
	items: string[][];
}

export interface ICatalogGetInlineButtonsParams {
	countMessage?: string;
}

export interface ICartGetInlineButtonsParam {
	countMessage: string;
	messagePay: string;
	productCount: string;
	productSum: string;
}
export interface IGenerateInlineButtons {
	items: IInlineButton[][];
}

interface IGenerateInlineButtonsItem {
	text: string;
	callback_data: string;
}

export type GenerateInlineButtonsReturnType = IGenerateInlineButtonsItem[][];

export type ShowProductModeType = 'create' | 'edit';

export interface ICreateProduct {
	ctx: IMyContext;
	image: string;
	caption: string;
	buttonsGroup: GenerateInlineButtonsReturnType;
}

export interface IEditProduct {
	ctx: IMyContext;
	messageId: string;
	image: string;
	caption: string;
	buttonsGroup: GenerateInlineButtonsReturnType;
}

export type IBindActions = IHandlerBase | IHandlerAction | IHandlerCustomAction;
