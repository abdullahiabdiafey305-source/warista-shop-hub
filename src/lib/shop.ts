import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BRANDS = ["iPhone", "Samsung"] as const;
export const CONDITIONS = [
  "New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
] as const;
export const STOCK_STATUSES = ["Active", "Reserved", "Sold"] as const;
export const PAYMENT_METHODS = ["PayPal", "CashApp", "Zelle"] as const;
export const ORDER_STATUSES = [
  "Pending Payment",
  "Paid",
  "Shipped",
  "Completed",
  "Cancelled",
] as const;

export const DEFAULT_BUSINESS_EMAIL = "alimandera@gmail.com";
export const DEFAULT_BUSINESS_PHONE = "+1 (701) 318-2784";

export type Brand = (typeof BRANDS)[number];
export type Condition = (typeof CONDITIONS)[number];
export type StockStatus = (typeof STOCK_STATUSES)[number];

export type ProductImage = { id: string; url: string; position: number };

export type Product = {
  id: string;
  brand: string;
  model: string;
  storage: string | null;
  color: string | null;
  condition: string;
  price: number | string;
  description: string | null;
  battery_health: number | null;
  stock_status: string;
  featured: boolean;
  created_at: string;
  product_images: ProductImage[];
};

export type Settings = {
  id: number;
  paypal_link: string | null;
  cashapp_tag: string | null;
  zelle_info: string | null;
  business_name: string | null;
  business_address: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_hours: string | null;
  whatsapp_catalog_url: string | null;
};

const PRODUCT_SELECT = "*, product_images(id, url, position)";

export function sortImages(product: Product): ProductImage[] {
  return [...(product.product_images ?? [])].sort((a, b) => a.position - b.position);
}

export function mainImage(product: Product): string | null {
  return sortImages(product)[0]?.url ?? null;
}

export function productTitle(product: Pick<Product, "model" | "storage">): string {
  return product.storage ? `${product.model} - ${product.storage}` : product.model;
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Product[];
}

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
});

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as unknown as Product | null;
    },
  });
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings | null> => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as unknown as Settings | null;
  },
});

export function conditionTone(condition: string): string {
  if (condition === "New") return "bg-success/12 text-success border-success/30";
  if (condition === "Used - Like New") return "bg-primary/10 text-primary border-primary/25";
  if (condition === "Used - Good") return "bg-brand/12 text-brand border-brand/30";
  return "bg-muted text-muted-foreground border-border";
}

export function stockTone(status: string): string {
  if (status === "Active") return "bg-success/12 text-success border-success/30";
  if (status === "Reserved") return "bg-warning/15 text-warning-foreground border-warning/40";
  return "bg-destructive/10 text-destructive border-destructive/25";
}
