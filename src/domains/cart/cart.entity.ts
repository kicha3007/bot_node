export class Cart {
	constructor(private readonly _userId: number) {}

	get userId(): number {
		return this._userId;
	}
}
