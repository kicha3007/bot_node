import { Cart } from './cart.entity';
import { CartModel } from '@prisma/client';

export type CartCreateReturn = Promise<CartModel>;

export type GetCartReturn = Promise<CartModel | null>;

export type GetCartParams = Pick<Cart, 'userId'>;

export interface ICartRepository {
	create: (cartParams: Cart) => CartCreateReturn;
	getCart: (cartParams: GetCartParams) => GetCartReturn;
}
