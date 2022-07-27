import { PrismaClient, ProductModel } from '@prisma/client';

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
	const user = {
		name: 'Иван',
		email: 'ivanov@test.ru',
	};

	await prisma.$connect();
	const createdUser = await prisma.userModel.create({ data: user });

	const cart = { userId: createdUser.id };

	const createdCart = await prisma.cartModel.create({ data: cart });

	const products = [
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

	await prisma.productModel.createMany({ data: products });

	const createdProducts = await prisma.productModel.findMany();

	const cartProducts = createdProducts.map((product) => ({
		productId: product.id,
		cartId: createdCart.id,
	}));

	await prisma.cartProductModel.createMany({ data: cartProducts });

	const contact = {
		city: 'Краснояр',
		address: 'Ивановская 10 стр 3',
		userId: createdUser.id,
	};

	await prisma.contactModel.create({ data: contact });

	await prisma.$disconnect();
};

main();
