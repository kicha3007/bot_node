export class Contact {
	constructor(
		private readonly _city: string,
		private readonly _address: string,
		private readonly _userId: number,
	) {}

	get city(): string {
		return this._city;
	}

	get address(): string {
		return this._address;
	}

	get userId(): number {
		return this._userId;
	}
}
