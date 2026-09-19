import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck, Truck, Wallet } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warista Electronics — New & Used iPhone and Samsung in Fargo, ND" },
      {
        name: "description",
        content:
          "Shop unlocked new and used iPhone and Samsung phones from Warista Electronics in Fargo, North Dakota. Clear condition grading and simple PayPal, CashApp or Zelle checkout.",
      },
      { property: "og:title", content: "Warista Electronics — Phones in Fargo, ND" },
      {
        property: "og:description",
        content: "New and used iPhone and Samsung devices, checked, graded and fairly priced.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  {
    icon: CheckCircle2,
    title: "1. Pick your phone",
    text: "Browse the listings and open the phone you want. Every listing shows condition, storage and battery health.",
  },
  {
    icon: Wallet,
    title: "2. Request to buy",
    text: "Send your details and choose PayPal, CashApp or Zelle. We reserve the phone for you right away.",
  },
  {
    icon: ShieldCheck,
    title: "3. Send payment",
    text: "You get payment instructions and an order number to include as the payment note.",
  },
  {
    icon: Truck,
    title: "4. We ship it",
    text: "As soon as payment clears we pack and ship your phone, and update your order status.",
  },
];

function Home() {
  const { data, isLoading, isError } = useQuery(productsQuery);
  const featured = (data ?? []).filter((p) => p.stock_status !== "Sold").slice(0, 8);

  return (
    <SiteLayout>
      <section className="hero-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-primary-foreground">
            <span className="inline-flex rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Fargo, North Dakota
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              New &amp; Used Samsung and iPhones
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              Warista Electronics is a small, local phone shop. Every device is tested, honestly
              graded and unlocked — with prices that make sense.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
                <Link to="/shop">Shop all phones</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/contact">Ask a question</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/shop"
              search={{ brand: "iPhone" }}
              className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <p className="font-display text-xl font-bold">iPhones</p>
              <p className="mt-1 text-sm text-primary-foreground/75">
                SE to 15 Pro Max, unlocked
              </p>
            </Link>
            <Link
              to="/shop"
              search={{ brand: "Samsung" }}
              className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <p className="font-display text-xl font-bold">Samsung</p>
              <p className="mt-1 text-sm text-primary-foreground/75">
                Galaxy A, S and Z series
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Latest arrivals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Freshly added stock, updated as phones come in.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/shop">View all</Link>
          </Button>
        </div>

        {isError && (
          <p className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            We couldn't load the listings right now. Please refresh the page.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))
            : featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {!isLoading && featured.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            No phones listed yet — check back soon.
          </p>
        )}
      </section>

      <section className="border-y border-border bg-primary-soft">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">How buying works</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No card checkout — you pay directly by PayPal, CashApp or Zelle.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/15 text-brand">
                  <s.icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-base font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
