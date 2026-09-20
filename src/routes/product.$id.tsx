import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BatteryMedium, ImageOff, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import {
  conditionTone,
  imageUrl,
  PAYMENT_METHODS,
  productQuery,
  productTitle,
  settingsQuery,
  sortImages,
  type Product,
} from "@/lib/shop";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Phone details — Warista Electronics" },
      {
        name: "description",
        content:
          "Full condition, storage, colour and battery details for this phone at Warista Electronics in Fargo, ND.",
      },
      { property: "og:title", content: "Phone details — Warista Electronics" },
      {
        property: "og:description",
        content: "Condition, storage and price details from Warista Electronics, Fargo ND.",
      },
    ],
  }),
  component: ProductDetail,
});

function BuyDialog({ product }: { product: Product }) {
  const navigate = useNavigate();
  const submitOrder = useServerFn(createOrder);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { data: settings } = useQuery(settingsQuery);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    shipping_address: "",
    payment_method: "PayPal",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.buyer_name.trim().length < 2) next['buyer_name'] = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyer_email.trim()))
      next['buyer_email'] = "Please enter a valid email address.";
    if (form.buyer_phone.trim().length < 7) next['buyer_phone'] = "Please enter a phone number.";
    if (form.shipping_address.trim().length < 10)
      next['shipping_address'] = "Please enter your full shipping address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const result = await submitOrder({
        data: {
          product_id: product.id,
          buyer_name: form.buyer_name.trim(),
          buyer_email: form.buyer_email.trim(),
          buyer_phone: form.buyer_phone.trim(),
          shipping_address: form.shipping_address.trim(),
          payment_method: form.payment_method as "PayPal" | "CashApp" | "Zelle",
          notes: form.notes.trim(),
        },
      });
      setOpen(false);
      navigate({ to: "/order/$id", params: { id: result.id } });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't submit your request. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
          Request to Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request {productTitle(product)}</DialogTitle>
          <DialogDescription>
            We'll reserve this phone and send you payment instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="buyer_name">Full name</Label>
            <Input
              id="buyer_name"
              className="mt-1.5"
              value={form.buyer_name}
              onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
            />
            {errors['buyer_name'] && (
              <p className="mt-1 text-xs text-destructive">{errors['buyer_name']}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="buyer_email">Email</Label>
              <Input
                id="buyer_email"
                type="email"
                className="mt-1.5"
                value={form.buyer_email}
                onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
              />
              {errors['buyer_email'] && (
                <p className="mt-1 text-xs text-destructive">{errors['buyer_email']}</p>
              )}
            </div>
            <div>
              <Label htmlFor="buyer_phone">Phone</Label>
              <Input
                id="buyer_phone"
                type="tel"
                className="mt-1.5"
                value={form.buyer_phone}
                onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
              />
              {errors['buyer_phone'] && (
                <p className="mt-1 text-xs text-destructive">{errors['buyer_phone']}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="shipping_address">Shipping address</Label>
            <Textarea
              id="shipping_address"
              rows={3}
              className="mt-1.5"
              value={form.shipping_address}
              onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
            />
            {errors['shipping_address'] && (
              <p className="mt-1 text-xs text-destructive">{errors['shipping_address']}</p>
            )}
          </div>
          <div>
            <Label>Preferred payment method</Label>
            <Select
              value={form.payment_method}
              onValueChange={(v) => setForm({ ...form, payment_method: v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 rounded-xl border border-brand/30 bg-brand/8 p-3 text-sm">
              <p className="font-semibold">{form.payment_method} selected</p>
              <p className="mt-1 text-muted-foreground">
                {form.payment_method === "PayPal"
                  ? "After you submit, we’ll show the secure PayPal payment link and your order reference."
                  : form.payment_method === "CashApp"
                    ? `After you submit, we’ll show the Cash App tag ${settings?.cashapp_tag || "provided by the seller"}.`
                    : `After you submit, we’ll show the Zelle details ${settings?.zelle_info || "provided by the seller"}.`}
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              className="mt-1.5"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Submitting…" : "Submit request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading, isError } = useQuery(productQuery(id));
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (isError || !product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Phone not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This listing may have been removed or sold.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const storedImages = sortImages(product);
  const images = storedImages.length
    ? storedImages.map((image) => ({ ...image, url: imageUrl(product, image.url) ?? image.url }))
    : [{ id: `fallback-${product.id}`, url: imageUrl(product) ?? "", position: 0 }];
  const current = images[Math.min(active, Math.max(images.length - 1, 0))];
  const available = product.stock_status === "Active";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
              {current ? (
                <img
                  src={current.url}
                  alt={productTitle(product)}
                  width={1024}
                  height={1024}
                  className="size-full object-contain p-6 transition-transform duration-300 group-hover:scale-125"
                />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <ImageOff className="size-10" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActive(i)}
                    className={`size-20 shrink-0 overflow-hidden rounded-lg border bg-secondary p-1 ${
                      i === active ? "border-brand ring-2 ring-brand/40" : "border-border"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img.url} alt="" loading="lazy" className="size-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conditionTone(product.condition)}`}
              >
                {product.condition}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  available
                    ? "border-success/30 bg-success/12 text-success"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {product.stock_status === "Active" ? "In Stock" : product.stock_status}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold">{productTitle(product)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.brand}
              {product.color ? ` · ${product.color}` : ""}
            </p>
            <p className="mt-4 text-4xl font-extrabold text-primary">
              {formatPrice(product.price)}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {product.storage && (
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Storage</dt>
                  <dd className="font-medium">{product.storage}</dd>
                </div>
              )}
              {product.color && (
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Colour</dt>
                  <dd className="font-medium">{product.color}</dd>
                </div>
              )}
              {product.battery_health != null && (
                <div className="rounded-lg border border-border p-3">
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BatteryMedium className="size-3.5" /> Battery health
                  </dt>
                  <dd className="font-medium">{product.battery_health}%</dd>
                </div>
              )}
            </dl>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-base font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              {available ? (
                <BuyDialog product={product} />
              ) : (
                <Button size="lg" className="w-full" disabled>
                  {product.stock_status === "Reserved" ? "Reserved" : "Sold"}
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Payment by PayPal, CashApp or Zelle after your request is confirmed.
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-primary-soft p-5 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-brand" /> Sold by Warista Electronics
              </p>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" /> Fargo, North Dakota
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
