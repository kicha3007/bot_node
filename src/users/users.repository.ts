import { IPrismaService } from '../database/prisma.service.interface';
import { User } from './user.entity';
import { UserModel } from '@prisma/client';
import { IUsersRepository } from './users.repository.interface';

export class UsersRepository implements IUsersRepository {
	constructor(private prismaService: IPrismaService) {}

	find({ id }: Pick<User, 'id'>): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findFirst({
			where: {
				id,
			},
		});
	}

	create({ name, id }: Pick<User, 'name' | 'id'>): Promise<UserModel> {
		return this.prismaService.client.userModel.create({
			data: {
				name,
				id,
			},
		});
	}
}
