import {
	AddCartProductReturn,
	getCartProductsReturn,
	ICartProductRepository,
	IGetCartProductsParams,
} from './cartProduct.repository.interface';
import { CartProduct } from './cartProduct.entity';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class CartProductRepository implements ICartProductRepository {
	constructor(private prismaService: IPrismaService) {}

	add({ cartId, productId }: CartProduct): AddCartProductReturn {
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

	async getProducts(params: IGetCartProductsParams = {}): getCartProductsReturn {
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
}
