import { IMyContext } from './common.interface';

export interface IHandlers {
	method: 'enter' | 'leave' | 'on';
	// TODO разобраться ка кэто типизировать
	command?: any;
	func: (ctx: IMyContext) => void;
}
