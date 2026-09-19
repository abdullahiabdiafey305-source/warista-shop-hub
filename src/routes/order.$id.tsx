import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, orderReference } from "@/lib/format";
import { getOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Your order — Warista Electronics" },
      {
        name: "description",
        content: "Order summary and payment instructions for your Warista Electronics purchase.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your order — Warista Electronics" },
      { property: "og:description", content: "Order summary and payment instructions." },
    ],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-16">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !data?.order) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Double-check your link, or contact us and we'll look it up.
          </p>
          <Button asChild className="mt-6">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const { order, product, settings } = data;
  const reference = orderReference(order.id);

  const instructions =
    order.payment_method === "PayPal"
      ? settings?.paypal_link || "PayPal details available on request"
      : order.payment_method === "CashApp"
        ? settings?.cashapp_tag || "CashApp tag available on request"
        : settings?.zelle_info || "Zelle details available on request";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-8 text-success" />
          <h1 className="text-2xl font-bold sm:text-3xl">Request received</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Thanks {order.buyer_name.split(" ")[0]} — your phone is reserved. Send payment using the
          instructions below and we'll ship as soon as it clears.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Order summary
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Order reference</span>
              <span className="font-semibold">{reference}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-right font-medium">
                {product ? `${product.model}${product.storage ? ` - ${product.storage}` : ""}` : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Condition</span>
              <span>{product?.condition ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total due</span>
              <span className="text-lg font-bold text-primary">
                {product ? formatPrice(product.price) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Ship to</span>
              <span className="max-w-[60%] text-right">{order.shipping_address}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-brand/40 bg-brand/8 p-6">
          <p className="font-display text-lg font-bold">Pay with {order.payment_method}</p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <code className="break-all text-sm font-semibold">{instructions}</code>
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy payment details"
              onClick={() => {
                navigator.clipboard.writeText(instructions);
                toast.success("Payment details copied");
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm">
            Include <span className="font-semibold">{reference}</span> as the payment note or
            reference so we can match your payment.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your phone ships once payment is confirmed. Questions? Email{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${settings?.business_email || "alimandera@gmail.com"}`}
            >
              {settings?.business_email || "alimandera@gmail.com"}
            </a>
            .
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline">
            <Link to="/shop">Keep browsing</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
