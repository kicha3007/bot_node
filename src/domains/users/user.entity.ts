export class User {
	constructor(private readonly _name: string, private readonly _id: number) {}

	get name(): string {
		return this._name;
	}

	get id(): number {
		return this._id;
	}
}
