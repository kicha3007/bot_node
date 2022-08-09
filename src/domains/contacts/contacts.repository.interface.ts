import { ContactModel } from '@prisma/client';
import { Contact } from './contact.entity';

export interface IContactsRepository {
	create: (contactInfo: Contact) => Promise<ContactModel>;
	find: ({ userId }: Pick<Contact, 'userId'>) => Promise<ContactModel | null>;
	delete: ({ userId }: Pick<Contact, 'userId'>) => Promise<ContactModel | null>;
}
