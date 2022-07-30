export interface IPrismaService {
	client: unknown;
	connect: () => void;
	disconnect: () => void;
}
