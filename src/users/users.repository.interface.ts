import { User } from './user.entity';
import { UserModel } from '@prisma/client';

export interface IUsersRepository {
	find: ({ id }: Pick<User, 'id'>) => Promise<UserModel | null>;
	create: ({ name, id }: Pick<User, 'name' | 'id'>) => Promise<UserModel>;
}
