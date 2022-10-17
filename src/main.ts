import { BotService } from './bot/bot.service';
import { LoggerService } from './infrastructure/logger/logger.service';
import { ConfigService } from './infrastructure/config/config.service';
import { PrismaService } from './infrastructure/database/prisma.service';
import { UsersRepository } from './domains/users/users.repository';
import { ContactsRepository } from './domains/contacts/contacts.repository';
import { CartRepository } from './domains/cart/cart.repository';
import { ProductsRepository } from './domains/products/products.repository';
import { CartProductRepository } from './domains/cart/cartProduct/cartProduct.repository';

const bootstrap = async (): Promise<void> => {
	const logger = new LoggerService();

	const prismaService = new PrismaService({ logger });
	await prismaService.connect();

	const repositories = {
		usersRepository: new UsersRepository(prismaService),
		contactsRepository: new ContactsRepository(prismaService),
		cartRepository: new CartRepository(prismaService),
		productsRepository: new ProductsRepository(prismaService),
		cartProductRepository: new CartProductRepository(prismaService),
	};

	const bot = new BotService({
		logger,
		configService: new ConfigService({ logger }),
		repositories,
	});
	await bot.init();
};

bootstrap();
