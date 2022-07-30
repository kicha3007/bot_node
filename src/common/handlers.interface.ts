import { IMyContext } from './common.interface';

export interface IHandlers {
	method: 'enter' | 'leave' | 'on';
	// TODO пока any, в дальнейшем разобраться
	command?: any;
	func: (ctx: IMyContext) => void;
}
