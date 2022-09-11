import {
	AddCartProductReturn,
	getCartProductsReturn,
	ICartProductRepository,
	IGetCartProductsParams,
	IRemoveProductParams,
	type RemoveProductReturn,
	type UpdateProductReturn,
	IUpdateProductParams,
} from './cartProduct.repository.interface';
import { CartProduct } from './cartProduct.entity';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class CartProductRepository implements ICartProductRepository {
	constructor(private prismaService: IPrismaService) {}

	add(params: CartProduct): AddCartProductReturn {
		const { cartId, productId } = params;

		return this.prismaService.client.cartProductModel.upsert({
			where: {
				productId,
			},
			update: {
				productCount: { increment: 1 },
			},
			create: {
				cartId,
				productId,
				productCount: 1,
			},
		});
	}

	getProducts(params: IGetCartProductsParams = {}): getCartProductsReturn {
		const { skip, take } = params;

		if (isNaN(<number>skip)) {
			return this.prismaService.client.cartProductModel.findMany({
				take,
			});
		} else {
			return this.prismaService.client.cartProductModel.findMany({
				skip,
				take,
			});
		}
	}

	removeProduct(params: IRemoveProductParams): RemoveProductReturn {
		const { productId } = params;

		return this.prismaService.client.cartProductModel.delete({
			where: {
				productId,
			},
		});
	}

	updateProduct(params: IUpdateProductParams): UpdateProductReturn {
		const { productId, productCount } = params;

		return this.prismaService.client.cartProductModel.update({
			where: {
				productId,
			},
			data: {
				productCount: productCount,
			},
		});
	}
}
