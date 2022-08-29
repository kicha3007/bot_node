import { CartProduct } from './cartProduct.entity';
import { CartProductModel } from '@prisma/client';

export type AddCartProductReturn = Promise<CartProductModel>;

export interface IGetCartProductsParams {
	skip?: number;
	take?: number;
}

export type getCartProductsReturn = Promise<CartProductModel[] | []>;

export interface ICartProductRepository {
	getProducts: (params?: IGetCartProductsParams) => getCartProductsReturn;
	add: (cartParams: CartProduct) => AddCartProductReturn;
}
