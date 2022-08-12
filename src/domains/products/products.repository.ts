import { IProductsRepository } from './products.repository.interface';
import { ProductModel } from '@prisma/client';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class ProductsRepository implements IProductsRepository {
	constructor(private prismaService: IPrismaService) {}

	getAll(): Promise<ProductModel[]> {
		return this.prismaService.client.productModel.findMany();
	}

	getProduct(): Promise<ProductModel | null> {
		return this.prismaService.client.productModel.findFirst();
	}
}
