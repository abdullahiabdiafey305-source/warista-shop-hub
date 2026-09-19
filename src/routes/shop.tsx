import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRANDS, CONDITIONS, productsQuery, productTitle, type Product } from "@/lib/shop";

type ShopSearch = {
  q?: string;
  brand?: string;
  condition?: string;
  min?: number;
  max?: number;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
};

const PAGE_SIZE = 12;

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
    brand: typeof search['brand'] === "string" && search['brand'] ? search['brand'] : undefined,
    condition:
      typeof search['condition'] === "string" && search['condition']
        ? search['condition']
        : undefined,
    min: Number.isFinite(Number(search['min'])) && search['min'] !== undefined && search['min'] !== ""
      ? Number(search['min'])
      : undefined,
    max: Number.isFinite(Number(search['max'])) && search['max'] !== undefined && search['max'] !== ""
      ? Number(search['max'])
      : undefined,
    sort:
      search['sort'] === "price-asc" || search['sort'] === "price-desc" || search['sort'] === "newest"
        ? search['sort']
        : undefined,
    page: Number(search['page']) > 1 ? Number(search['page']) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop phones — Warista Electronics, Fargo ND" },
      {
        name: "description",
        content:
          "Browse every iPhone and Samsung in stock at Warista Electronics. Filter by brand, condition and price.",
      },
      { property: "og:title", content: "Shop phones — Warista Electronics" },
      {
        property: "og:description",
        content: "Every iPhone and Samsung currently in stock in Fargo, ND.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data, isLoading, isError } = useQuery(productsQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState(search.q ?? "");

  const setSearch = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, page: undefined, ...patch }) });

  const filtered = useMemo(() => {
    let list: Product[] = data ?? [];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) =>
        `${p.brand} ${p.model} ${p.storage ?? ""} ${p.color ?? ""}`.toLowerCase().includes(q),
      );
    }
    if (search.brand) list = list.filter((p) => p.brand === search.brand);
    if (search.condition) list = list.filter((p) => p.condition === search.condition);
    if (search.min !== undefined) list = list.filter((p) => Number(p.price) >= search.min!);
    if (search.max !== undefined) list = list.filter((p) => Number(p.price) <= search.max!);

    const sorted = [...list];
    if (search.sort === "price-asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (search.sort === "price-desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return sorted;
  }, [data, search]);

  const page = search.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(
    search.q || search.brand || search.condition || search.min !== undefined || search.max !== undefined,
  );

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="shop-search">Search</Label>
        <form
          className="mt-1.5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch({ q: keyword.trim() || undefined });
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="shop-search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Model or keyword"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </form>
      </div>

      <div>
        <Label>Brand</Label>
        <Select
          value={search.brand ?? "all"}
          onValueChange={(v) => setSearch({ brand: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {BRANDS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Condition</Label>
        <Select
          value={search.condition ?? "all"}
          onValueChange={(v) => setSearch({ condition: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any condition</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Price range (USD)</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={search.min ?? ""}
            onChange={(e) =>
              setSearch({ min: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={search.max ?? ""}
            onChange={(e) =>
              setSearch({ max: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setKeyword("");
            navigate({ search: {} });
          }}
        >
          <X className="mr-1 size-4" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">The collection</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Find your next phone</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">Unlocked iPhones and Samsung devices, clearly graded and ready for a new home.</p>
          </div>
          <div className="rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-sm"><p className="text-2xl font-bold leading-none">{isLoading ? "—" : filtered.length}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">devices found</p></div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {isLoading ? "Loading inventory…" : `${filtered.length} phone${filtered.length === 1 ? "" : "s"} available`}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Button
              variant="outline"
              className="w-full lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="mr-2 size-4" />
              {showFilters ? "Hide filters" : "Filters & search"}
            </Button>
            <div
              className={`${showFilters ? "block" : "hidden"} soft-panel mt-4 rounded-2xl border border-border p-5 lg:mt-0 lg:block`}
            >
              {filterPanel}
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium text-muted-foreground">
                Page {page} of {pageCount}
              </p>
              <Select
                value={search.sort ?? "newest"}
                onValueChange={(v) => setSearch({ sort: v as ShopSearch["sort"] })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isError && (
              <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                We couldn't load the listings. Please refresh and try again.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-xl" />
                  ))
                : visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {!isLoading && visible.length === 0 && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
                <p className="font-medium">No phones match those filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try widening your price range or clearing the search.
                </p>
              </div>
            )}

            {pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

export { productTitle };
