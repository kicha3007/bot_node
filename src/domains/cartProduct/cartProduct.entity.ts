export class CartProduct {
	constructor(private readonly _cartId: number, private readonly _productId: number) {}

	get cartId(): number {
		return this._cartId;
	}

	get productId(): number {
		return this._productId;
	}
}
