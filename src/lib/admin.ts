import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import type { Product, Settings } from "@/lib/shop";

export type AdminOrder = {
  id: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  shipping_address: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  product: { id: string; model: string; storage: string | null; brand: string; price: number | null } | null;
};

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export async function requireAdminSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw redirect({ to: "/admin/login" });
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.session.user.id)
    .maybeSingle();

  if (roleError || !roleData || roleData.role !== "admin") {
    throw redirect({ to: "/admin/login" });
  }

  return data.session;
}

export function getStoredReadMessageIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const next = JSON.parse(localStorage.getItem("warista-admin-read-messages") ?? "[]");
    return Array.isArray(next) ? next.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function setStoredReadMessageIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("warista-admin-read-messages", JSON.stringify(ids));
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, url, position)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as Product[];
}

export async function fetchAdminProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, url, position)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Product | null;
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, notes, created_at, product_id, products(id, model, storage, brand, price)",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((order) => ({
    ...order,
    product: order.products ? {
      id: order.products.id,
      model: order.products.model,
      storage: order.products.storage,
      brand: order.products.brand,
      price: order.products.price,
    } : null,
  })) as AdminOrder[];
}

export async function fetchAdminOrder(id: string): Promise<AdminOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, notes, created_at, product_id, products(id, model, storage, brand, price)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    product: data.products
      ? {
          id: data.products.id,
          model: data.products.model,
          storage: data.products.storage,
          brand: data.products.brand,
          price: data.products.price,
        }
      : null,
  } as AdminOrder;
}

export async function fetchAdminMessages(): Promise<AdminMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as AdminMessage[];
}

export async function fetchAdminSettings(): Promise<Settings | null> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Settings | null;
}

export async function uploadProductImages(productId: string, files: File[]) {
  const uploaded: Array<{ id?: string; url: string; position: number }> = [];

  for (const file of files) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
    const path = `${productId}/${name}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    uploaded.push({ url: urlData.publicUrl, position: uploaded.length });
  }

  if (uploaded.length === 0) return;

  const { data: existingImages, error: existingError } = await supabase
    .from("product_images")
    .select("id, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (existingError) throw new Error(existingError.message);

  const basePosition = existingImages?.length ?? 0;
  const rows = uploaded.map((image, index) => ({
    product_id: productId,
    url: image.url,
    position: basePosition + index,
  }));

  const { error: insertError } = await supabase.from("product_images").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

export function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
