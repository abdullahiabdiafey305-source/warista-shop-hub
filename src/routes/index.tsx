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
      <section className="hero-surface tech-grid overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="size-1.5 rounded-full bg-brand" /> Fargo, North Dakota
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Phones that fit your life, <span className="text-brand">not your budget.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/75 sm:text-lg">
              Warista Electronics is a small, local phone shop. Every device is tested, honestly
              graded and unlocked — with prices that make sense.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
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
          <div className="relative grid gap-3 sm:grid-cols-2 lg:pl-8">
            <div className="pointer-events-none absolute -right-8 -top-12 hidden size-56 rounded-full border border-brand/30 lg:block" />
            <Link
              to="/shop"
              search={{ brand: "iPhone" }}
              className="group rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 text-primary-foreground backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-primary-foreground/20"
            >
              <p className="font-display text-xl font-bold transition-colors group-hover:text-brand">iPhones</p>
              <p className="mt-1 text-sm text-primary-foreground/75">
                SE to 15 Pro Max, unlocked
              </p>
            </Link>
            <Link
              to="/shop"
              search={{ brand: "Samsung" }}
              className="group rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 text-primary-foreground backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-primary-foreground/20"
            >
              <p className="font-display text-xl font-bold transition-colors group-hover:text-brand">Samsung</p>
              <p className="mt-1 text-sm text-primary-foreground/75">
                Galaxy A, S and Z series
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:grid-cols-3">
          {[
            ["01", "Tested devices", "Every phone is checked before listing."],
            ["02", "Honest grading", "Clear condition notes and battery health."],
            ["03", "Local support", "Real answers from a Fargo-based seller."],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-3 border-border sm:border-r sm:px-5 first:pl-0 last:border-0">
              <span className="font-display text-sm font-bold text-brand">{number}</span>
              <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Fresh inventory</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Latest arrivals</h2>
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Simple from start to finish</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">How buying works</h2>
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
