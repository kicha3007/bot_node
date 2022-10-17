export abstract class BaseSceneTemplate {
	static getPositionMessage(currentPosition: number, itemsLength: number | string): string {
		return `${currentPosition} из ${itemsLength}`;
	}
}
