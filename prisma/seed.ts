import { PrismaClient, ProductModel, UserModel, CartModel, ContactModel } from '@prisma/client';

const prisma = new PrismaClient();

const userInfo = {
	name: 'Иван',
	id: 1,
};

const productsList = [
	{
		title: 'Шарик 1',
		price: 100,
		description: 'Описание шарика 1',
		image: 'https://megashar-nsk.ru/images/gelievye_shary/2021/gelievue-shary2021-2.jpg',
		size: 's',
	},
	{
		title: 'Шарик 2',
		price: 300,
		description: 'Описание шарика 2',
		image:
			'https://84.img.avito.st/image/1/1.GTXVcba6tdzj2HfZ61VTayfSs9hhUr0eZNKx1GHatw.QCwhmlW15b3YaWgq-C09OvE-5VJHN7AKhQgEZhXP95U',
		size: 'm',
	},
	{
		title: 'Шарик 3',
		price: 400,
		description: 'Описание шарика 3',
		image: 'https://i.pinimg.com/originals/64/4f/55/644f551289e01fdf9e4a05172bf373b4.jpg',
		size: 's',
	},
	{
		title: 'Шарик 4',
		price: 400,
		description: 'Описание шарика 4',
		image:
			'https://shop-cdn1.vigbo.tech/shops/46256//products/14365412/images/2-f45526fa9644dba03ab9d49703102a35.jpg?version=undefined',
		size: 's',
	},
	{
		title: 'Шарик 5',
		price: 400,
		description: 'Описание товара',
		image: 'https://st.shop-serpantin.ru/8/2503/238/tOod87GfeHY.jpg',
		size: 's',
	},
];

interface ICreateUserProps {
	user: Pick<UserModel, 'name' | 'id'>;
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
	products: Array<Pick<ProductModel, 'title' | 'description' | 'image' | 'size' | 'price'>>;
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

	//TODO пока закомментировал добавление всех остальных данных в бд, кроме продуктов, в целях удобства разработки

	/*	const createdUser = await createUser({ user: userInfo });

	const cart = { userId: createdUser.id };
	const createdCart = await createCart({ cart });*/

	await createProducts({ products: productsList });
	/*const createdProducts = await getProducts();
	await fillCartProducts({ products: createdProducts, cartId: createdCart.id });

	const contact = {
		city: 'Краснояр',
		address: 'Шикарная 10 стр 3',
		userId: createdUser.id,
	};
	await createContact({ contact });*/

	await prisma.$disconnect();
};

main();
