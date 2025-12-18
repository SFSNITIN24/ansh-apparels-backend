import type { Product } from "@/types/product";
import { productsRepository } from "@/repositories/products.repository";

export const productsService = {
  async list(): Promise<Product[]> {
    return await productsRepository.findAll();
  },
  async getBySlug(slug: string): Promise<Product | null> {
    return (await productsRepository.findBySlug(slug)) ?? null;
  },
};


