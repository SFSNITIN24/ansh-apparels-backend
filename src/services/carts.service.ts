import { cartsRepository } from "@/repositories/carts.repository";
import type { Cart, CartItem } from "@/types/cart";

export const cartsService = {
  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart> {
    return cartsRepository.getByUserId(userId);
  },

  /**
   * Add item to user's cart
   */
  async addItem(userId: string, item: CartItem): Promise<Cart> {
    return cartsRepository.addItem(userId, item);
  },

  /**
   * Update item quantity in cart
   */
  async updateQuantity(
    userId: string,
    slug: string,
    size: string,
    quantity: number
  ): Promise<Cart> {
    return cartsRepository.updateItemQuantity(userId, slug, size, quantity);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, slug: string, size: string): Promise<Cart> {
    return cartsRepository.removeItem(userId, slug, size);
  },

  /**
   * Clear cart (after checkout)
   */
  async clearCart(userId: string): Promise<void> {
    return cartsRepository.clear(userId);
  },

  /**
   * Merge guest cart into user cart (called after login)
   */
  async mergeGuestCart(userId: string, guestItems: CartItem[]): Promise<Cart> {
    if (!guestItems || guestItems.length === 0) {
      return cartsRepository.getByUserId(userId);
    }
    return cartsRepository.merge(userId, guestItems);
  },
};

