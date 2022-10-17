import { CartProduct } from './cartProduct.entity';
import { CartProductModel } from '@prisma/client';

export type AddCartProductReturn = Promise<CartProductModel>;

export interface IGetCartProductsParams {
	skip?: number;
	take?: number;
}

export type getCartProductsReturn = Promise<CartProductModel[]>;

export interface IRemoveProductParams {
	productId: number;
}

export type RemoveProductReturn = Promise<CartProductModel>;

export interface IUpdateProductParams {
	productId: number;
	productCount: number;
}

export type UpdateProductReturn = Promise<CartProductModel>;

export interface ICartProductRepository {
	getProducts: (params?: IGetCartProductsParams) => getCartProductsReturn;
	add: (params: CartProduct) => AddCartProductReturn;
	removeProduct: (params: IRemoveProductParams) => RemoveProductReturn;
	updateProduct: (params: IUpdateProductParams) => UpdateProductReturn;
}
