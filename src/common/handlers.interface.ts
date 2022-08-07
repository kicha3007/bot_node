import { IMyContext } from './common.interface';

export interface IHandler {
	method: 'enter' | 'leave';
	func: (ctx: IMyContext) => void;
}

export interface IHandlerCommand {
	method: 'on';
	command: 'text' | 'text'[];
	func: (ctx: IMyContext) => void;
}
