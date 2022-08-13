import { ProductModel } from '@prisma/client';

export interface IGetProductsParams {
	skip?: number;
	take?: number;
}

export type getProductsReturn = Promise<ProductModel[] | []>;

export interface IProductsRepository {
	getProducts: (params?: IGetProductsParams) => getProductsReturn;
}
