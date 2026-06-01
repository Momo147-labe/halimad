import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin } from "lucide-react";
import type { Product } from "@/lib/store";
import { formatGNF } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">{product.title}</h3>
          {product.verified && (
            <span
              title="Vendeur vérifié"
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
            >
              <BadgeCheck className="size-3.5" /> Vérifié
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-primary">{formatGNF(product.price_gnf)}</div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {product.city}
          </span>
          <span className="rounded bg-secondary px-2 py-0.5">{product.category}</span>
        </div>
      </div>
    </Link>
  );
}
