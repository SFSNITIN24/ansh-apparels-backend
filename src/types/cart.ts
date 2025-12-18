export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
};
