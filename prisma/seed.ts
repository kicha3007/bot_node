import { PrismaClient, ProductModel, UserModel, CartModel, ContactModel } from '@prisma/client';

const prisma = new PrismaClient();

const productsList = [
	{
		title: 'Шарик 1',
		price: 100,
		description:
			'Описание шарика 1 "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ',
		image: 'https://megashar-nsk.ru/images/gelievye_shary/2021/gelievue-shary2021-2.jpg',
		size: 's',
	},
	{
		title: 'Шарик 2',
		price: 300,
		description:
			'Описание шарика 2 "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ',
		image:
			'https://84.img.avito.st/image/1/1.GTXVcba6tdzj2HfZ61VTayfSs9hhUr0eZNKx1GHatw.QCwhmlW15b3YaWgq-C09OvE-5VJHN7AKhQgEZhXP95U',
		size: 'm',
	},
	{
		title: 'Шарик 3',
		price: 400,
		description:
			'Описание шарика 3 "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ',
		image: 'https://i.pinimg.com/originals/64/4f/55/644f551289e01fdf9e4a05172bf373b4.jpg',
		size: 's',
	},
	{
		title: 'Шарик 4',
		price: 400,
		description:
			'Описание шарика 4 "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ',
		image:
			'https://shop-cdn1.vigbo.tech/shops/46256//products/14365412/images/2-f45526fa9644dba03ab9d49703102a35.jpg?version=undefined',
		size: 's',
	},
	{
		title: 'Шарик 5',
		price: 400,
		description:
			'Описание товара "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ',
		image: 'https://st.shop-serpantin.ru/8/2503/238/tOod87GfeHY.jpg',
		size: 's',
	},
];

interface ICreateProductProps {
	products: Array<Pick<ProductModel, 'title' | 'description' | 'image' | 'size' | 'price'>>;
}

const createProducts = async ({ products }: ICreateProductProps): Promise<void> => {
	await prisma.productModel.createMany({ data: products });
};

const main = async (): Promise<void> => {
	await prisma.$connect();
	await createProducts({ products: productsList });
	await prisma.$disconnect();
};

main();
