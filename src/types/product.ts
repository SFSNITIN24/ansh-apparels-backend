export type ProductCategory = "men" | "women";

export type ProductSize = {
  label: string;
  /**
   * Available quantity for this size. 0 means out of stock.
   */
  quantity: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: ProductCategory;
  sizes: ProductSize[];
  images: string[];
};
