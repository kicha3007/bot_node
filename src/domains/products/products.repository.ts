import {
	IProductsRepository,
	IGetProductsParams,
	getProductsReturn,
	IGetProductParams,
	getProductReturn,
} from './products.repository.interface';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class ProductsRepository implements IProductsRepository {
	constructor(private prismaService: IPrismaService) {}

	async getProducts(params: IGetProductsParams = {}): getProductsReturn {
		const { skip, take } = params;

		if (isNaN(<number>skip)) {
			return this.prismaService.client.productModel.findMany({
				take,
			});
		} else {
			return this.prismaService.client.productModel.findMany({
				skip,
				take,
			});
		}
	}

	async getProduct(params: IGetProductParams = {}): getProductReturn {
		return this.prismaService.client.productModel.findUnique({
			where: { id: params.id },
		});
	}
}
