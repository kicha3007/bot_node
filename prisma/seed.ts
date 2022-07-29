import { PrismaClient, ProductModel, UserModel, CartModel, ContactModel } from '@prisma/client';

const prisma = new PrismaClient();

const userInfo = {
	name: 'Иван',
	email: 'ivanov@test.ru',
};

const productsList = [
	{
		title: 'Первый товар',
		description: 'Описание товара',
		image: '',
		size: 's',
	},
	{
		title: 'Второй товар',
		description: 'Описание товара',
		image: '',
		size: 'm',
	},
	{
		title: 'Третий товар',
		description: 'Описание товара',
		image: '',
		size: 's',
	},
];

interface ICreateUserProps {
	user: Pick<UserModel, 'name' | 'email'>;
}

const createUser = async ({ user }: ICreateUserProps): Promise<UserModel> => {
	return prisma.userModel.create({ data: user });
};

interface ICreateCartProps {
	cart: Pick<CartModel, 'userId'>;
}

const createCart = async ({ cart }: ICreateCartProps): Promise<CartModel> => {
	return await prisma.cartModel.create({ data: cart });
};

interface ICreateProductProps {
	products: Array<Pick<ProductModel, 'title' | 'description' | 'image' | 'size'>>;
}

const createProducts = async ({ products }: ICreateProductProps): Promise<void> => {
	await prisma.productModel.createMany({ data: products });
};

const getProducts = async (): Promise<Array<ProductModel>> => {
	return prisma.productModel.findMany();
};

interface IFillCartProductsProps {
	products: Array<ProductModel>;
	cartId: number;
}

const fillCartProducts = async ({ products, cartId }: IFillCartProductsProps): Promise<void> => {
	const cartProducts = products.map((product) => ({
		productId: product.id,
		cartId,
	}));

	await prisma.cartProductModel.createMany({ data: cartProducts });
};

interface ICreateContact {
	contact: Pick<ContactModel, 'city' | 'address' | 'userId'>;
}

const createContact = async ({ contact }: ICreateContact): Promise<void> => {
	await prisma.contactModel.create({ data: contact });
};

const main = async (): Promise<void> => {
	await prisma.$connect();

	const createdUser = await createUser({ user: userInfo });

	const cart = { userId: createdUser.id };
	const createdCart = await createCart({ cart });

	await createProducts({ products: productsList });
	const createdProducts = await getProducts();
	await fillCartProducts({ products: createdProducts, cartId: createdCart.id });

	const contact = {
		city: 'Краснояр',
		address: 'Шикарная 10 стр 3',
		userId: createdUser.id,
	};
	await createContact({ contact });

	await prisma.$disconnect();
};

main();
