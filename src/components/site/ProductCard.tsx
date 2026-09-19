import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { conditionTone, mainImage, productTitle, type Product } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const image = mainImage(product);
  const sold = product.stock_status === "Sold";
  const reserved = product.stock_status === "Reserved";

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image ? (
          <img
            src={image}
            alt={productTitle(product)}
            loading="lazy"
            className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        {(sold || reserved) && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-xs font-semibold text-background">
            {sold ? "Sold" : "Reserved"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold ${conditionTone(product.condition)}`}
        >
          {product.condition}
        </span>
        <p className="font-display text-sm font-semibold leading-snug">
          {productTitle(product)}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.brand}
          {product.color ? ` · ${product.color}` : ""}
        </p>
        <p className="mt-auto pt-2 text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
