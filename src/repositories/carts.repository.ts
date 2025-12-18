import { getDb } from "@/lib/mongo";
import type { Cart, CartItem } from "@/types/cart";

const COLLECTION = "carts";

async function col() {
  const db = await getDb();
  return db.collection<Omit<Cart, "id"> & { _id: string }>(COLLECTION);
}

export const cartsRepository = {
  /**
   * Get cart by user ID (creates empty cart if not exists)
   */
  async getByUserId(userId: string): Promise<Cart> {
    const c = await col();
    const doc = await c.findOne({ _id: userId });
    
    if (!doc) {
      // Create empty cart for user
      const newCart: Omit<Cart, "id"> & { _id: string } = {
        _id: userId,
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      await c.insertOne(newCart);
      return { id: userId, userId, items: [], updatedAt: newCart.updatedAt };
    }
    
    return {
      id: doc._id,
      userId: doc.userId,
      items: doc.items,
      updatedAt: doc.updatedAt,
    };
  },

  /**
   * Save cart (upsert)
   */
  async save(userId: string, items: CartItem[]): Promise<Cart> {
    const c = await col();
    const updatedAt = new Date().toISOString();
    
    await c.updateOne(
      { _id: userId },
      {
        $set: {
          userId,
          items,
          updatedAt,
        },
      },
      { upsert: true }
    );
    
    return { id: userId, userId, items, updatedAt };
  },

  /**
   * Add item to cart (or update quantity if exists)
   */
  async addItem(userId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getByUserId(userId);
    const existingIdx = cart.items.findIndex(
      (i) => i.slug === item.slug && i.size === item.size
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    return this.save(userId, cart.items);
  },

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    userId: string,
    slug: string,
    size: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getByUserId(userId);
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items = cart.items.filter(
        (i) => !(i.slug === slug && i.size === size)
      );
    } else {
      const item = cart.items.find((i) => i.slug === slug && i.size === size);
      if (item) {
        item.quantity = quantity;
      }
    }

    return this.save(userId, cart.items);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, slug: string, size: string): Promise<Cart> {
    const cart = await this.getByUserId(userId);
    cart.items = cart.items.filter(
      (i) => !(i.slug === slug && i.size === size)
    );
    return this.save(userId, cart.items);
  },

  /**
   * Clear entire cart
   */
  async clear(userId: string): Promise<void> {
    const c = await col();
    await c.updateOne(
      { _id: userId },
      { $set: { items: [], updatedAt: new Date().toISOString() } }
    );
  },

  /**
   * Merge guest cart items into user cart
   */
  async merge(userId: string, guestItems: CartItem[]): Promise<Cart> {
    const cart = await this.getByUserId(userId);

    for (const guestItem of guestItems) {
      const existingIdx = cart.items.findIndex(
        (i) => i.slug === guestItem.slug && i.size === guestItem.size
      );

      if (existingIdx >= 0) {
        // Add quantities together
        cart.items[existingIdx].quantity += guestItem.quantity;
      } else {
        // Add new item
        cart.items.push(guestItem);
      }
    }

    return this.save(userId, cart.items);
  },
};

