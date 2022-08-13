import {
	IProductsRepository,
	IGetProductsParams,
	getProductsReturn,
} from './products.repository.interface';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class ProductsRepository implements IProductsRepository {
	constructor(private prismaService: IPrismaService) {}

	async getProducts(params: IGetProductsParams = {}): getProductsReturn {
		const { skip, take = 1 } = params;

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
}
