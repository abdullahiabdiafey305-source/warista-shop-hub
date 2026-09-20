import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { conditionTone, imageUrl, mainImage, productTitle, type Product } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const image = imageUrl(product, mainImage(product));
  const sold = product.stock_status === "Sold";
  const reserved = product.stock_status === "Reserved";

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[1.05/1] overflow-hidden bg-secondary/70">
        {image ? (
          <img
            src={image}
            alt={productTitle(product)}
            loading="lazy"
            className="size-full object-contain p-5 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        {(sold || reserved) && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
            {sold ? "Sold" : "Reserved"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <span
          className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${conditionTone(product.condition)}`}
        >
          {product.condition}
        </span>
        <p className="font-display text-sm font-semibold leading-snug sm:text-base">
          {productTitle(product)}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.brand}
          {product.color ? ` · ${product.color}` : ""}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          <span className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
