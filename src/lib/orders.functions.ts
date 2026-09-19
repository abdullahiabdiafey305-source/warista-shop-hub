import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  buyer_name: z.string().trim().min(2).max(120),
  buyer_email: z.string().trim().email().max(180),
  buyer_phone: z.string().trim().min(7).max(40),
  shipping_address: z.string().trim().min(10).max(500),
  payment_method: z.enum(["PayPal", "CashApp", "Zelle"]),
  notes: z.string().trim().max(1000).optional().default(""),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, stock_status, model")
      .eq("id", data.product_id)
      .maybeSingle();

    if (productError) throw new Error(productError.message);
    if (!product) throw new Error("This phone is no longer listed.");
    if (product.stock_status !== "Active") {
      throw new Error("Sorry, this phone is no longer available.");
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        product_id: data.product_id,
        buyer_name: data.buyer_name,
        buyer_email: data.buyer_email,
        buyer_phone: data.buyer_phone,
        shipping_address: data.shipping_address,
        payment_method: data.payment_method,
        notes: data.notes ?? "",
        status: "Pending Payment",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(orderError.message);

    await supabaseAdmin
      .from("products")
      .update({ stock_status: "Reserved", updated_at: new Date().toISOString() })
      .eq("id", data.product_id);

    return { id: order.id };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, status, payment_method, buyer_name, buyer_email, buyer_phone, shipping_address, notes, created_at, product_id",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, brand, model, storage, color, condition, price")
      .eq("id", order.product_id ?? "")
      .maybeSingle();

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("paypal_link, cashapp_tag, zelle_info, business_name, business_email, business_address")
      .eq("id", 1)
      .maybeSingle();

    return { order, product, settings };
  });
