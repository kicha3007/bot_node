import {
	CartCreateReturn,
	ICartRepository,
	GetCartParams,
	GetCartReturn,
} from './cart.repository.interface';
import { Cart } from './cart.entity';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class CartRepository implements ICartRepository {
	constructor(private prismaService: IPrismaService) {}

	create({ userId }: Cart): CartCreateReturn {
		return this.prismaService.client.cartModel.upsert({
			where: {
				userId,
			},
			update: {},
			create: {
				userId,
			},
		});
	}

	async getCart(params: GetCartParams): GetCartReturn {
		return this.prismaService.client.cartModel.findUnique({
			where: { userId: params.userId },
		});
	}
}
