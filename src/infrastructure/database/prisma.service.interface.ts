import { PrismaClient } from '@prisma/client';

export interface IPrismaService {
	client: PrismaClient;
	connect: () => void;
	disconnect: () => void;
}
