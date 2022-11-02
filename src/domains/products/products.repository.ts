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

	public async getProducts(params: IGetProductsParams = {}): getProductsReturn {
		const { skip, take, where } = params;

		if (isNaN(<number>skip)) {
			return this.prismaService.client.productModel.findMany({
				where,
				take,
			});
		} else {
			return this.prismaService.client.productModel.findMany({
				skip,
				take,
			});
		}
	}

	public async getProduct(params: IGetProductParams = {}): getProductReturn {
		return this.prismaService.client.productModel.findUnique({
			where: { id: params.id },
		});
	}
}
