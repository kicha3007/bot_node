import { IContactsRepository } from './contacts.repository.interface';
import { Contact } from './contact.entity';
import { ContactModel } from '@prisma/client';
import { IPrismaService } from '../../infrastructure/database/prisma.service.interface';

export class ContactsRepository implements IContactsRepository {
	constructor(private prismaService: IPrismaService) {}

	create({ city, address, userId }: Contact): Promise<ContactModel> {
		return this.prismaService.client.contactModel.create({
			data: {
				city,
				address,
				userId,
			},
		});
	}

	find({ userId }: Pick<Contact, 'userId'>): Promise<ContactModel | null> {
		return this.prismaService.client.contactModel.findFirst({
			where: {
				userId,
			},
		});
	}

	delete({ userId }: Pick<Contact, 'userId'>): Promise<ContactModel | null> {
		return this.prismaService.client.contactModel.delete({
			where: {
				userId,
			},
		});
	}
}
