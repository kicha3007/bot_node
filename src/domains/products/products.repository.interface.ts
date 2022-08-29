import { ProductModel } from '@prisma/client';

export interface IGetProductsParams {
	skip?: number;
	take?: number;
}

export type getProductsReturn = Promise<ProductModel[] | []>;

export type getProductReturn = Promise<ProductModel | null>;

export interface IGetProductParams {
	id?: number;
}

export interface IProductsRepository {
	getProducts: (params?: IGetProductsParams) => getProductsReturn;
	getProduct: (params?: IGetProductParams) => getProductReturn;
}
