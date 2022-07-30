import { Markup } from 'telegraf';

export class KeyboardsServices {
	// TODO временно any
	public startMenu(): any {
		return (
			'Введите фразу <i>"удалить `порядковый номер задачи`"</i>, чтобы удалить сообщение,' +
			'например, <b>"удалить 3"</b>:'
		);
		/*	return Markup.keyboard(['/1', '/2']).oneTime().resize();*/
	}
}
