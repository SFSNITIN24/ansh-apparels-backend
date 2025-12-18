import crypto from "crypto";

import { contactsRepository } from "@/repositories/contacts.repository";
import type { ContactMessage } from "@/types/contact";

export const contactsService = {
  async submit(input: {
    name: string;
    message: string;
    phone?: string;
    email?: string;
  }): Promise<ContactMessage> {
    const name = input.name?.trim();
    const message = input.message?.trim();
    if (!name || !message) {
      throw new Error("Name and message are required");
    }

    const msg: ContactMessage = {
      id: crypto.randomUUID(),
      name,
      phone: input.phone?.trim() || undefined,
      email: input.email?.trim() || undefined,
      message,
      createdAt: new Date().toISOString(),
    };

    return await contactsRepository.create(msg);
  },
  async list(): Promise<ContactMessage[]> {
    return await contactsRepository.list();
  },
  async delete(id: string): Promise<boolean> {
    return await contactsRepository.delete(id);
  },
};


