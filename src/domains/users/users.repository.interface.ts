import { User } from './user.entity';
import { UserModel } from '@prisma/client';

export type UserFindParams = Pick<User, 'id'>;
export type UserFindReturn = Promise<UserModel | null>;

export type UserCreateParams = Pick<User, 'name' | 'id'>;
export type UserCreateReturn = Promise<UserModel>;

export interface IUsersRepository {
	find: ({ id }: UserFindParams) => UserFindReturn;
	create: ({ name, id }: UserCreateParams) => UserCreateReturn;
}
