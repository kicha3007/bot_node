import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';
import {
	IUsersRepository,
	UserCreateParams,
	UserCreateReturn,
	UserFindParams,
	UserFindReturn,
} from './users.repository.interface';

export class UsersRepository implements IUsersRepository {
	constructor(private prismaService: IPrismaService) {}

	find({ id }: UserFindParams): UserFindReturn {
		return this.prismaService.client.userModel.findFirst({
			where: {
				id,
			},
		});
	}

	create({ name, id }: UserCreateParams): UserCreateReturn {
		return this.prismaService.client.userModel.create({
			data: {
				name,
				id,
			},
		});
	}
}
