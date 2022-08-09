import { ProductModel } from '@prisma/client';

export interface IProductsRepository {
	getAll: () => Promise<ProductModel[]>;
	getProduct: () => Promise<ProductModel | null>;
}
