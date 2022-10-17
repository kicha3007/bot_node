export class Contact {
	constructor(private readonly _address: string, private readonly _userId: number) {}

	get address(): string {
		return this._address;
	}

	get userId(): number {
		return this._userId;
	}
}
