import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct, useSession, useUpsertConversation } from "@/lib/hooks";
import {
  formatGNF,
  whatsappUrl,
  type Conversation,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, MessageCircle, ChevronDown, ArrowLeft, Tag, ShieldCheck, Clock, Share2 } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 backdrop-blur-sm">
        <Tag className="size-12 text-muted-foreground/50" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Produit introuvable</h1>
      <p className="mt-2 text-muted-foreground">L'annonce que vous recherchez n'existe plus ou a été retirée.</p>
      <Button asChild size="lg" className="mt-8 rounded-full">
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { user, loading } = useSession();
  const upsertConversation = useUpsertConversation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="animate-pulse text-sm font-medium text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }
  
  if (!product) throw notFound();

  const msg = `Bonjour ${product.seller_name}, je suis intéressé par votre produit "${product.title}" (code ${product.code}) sur HaliMad. Est-il toujours disponible ?`;
  const contactUrl = whatsappUrl(product.seller_whatsapp, msg);

  const contactSeller = () => {
    const conversation: Omit<Conversation, "id" | "created_at" | "last_message_at"> = {
      product_id: product.id,
      product_code: product.code,
      product_title: product.title,
      product_image_url: product.image_url,
      price_gnf: product.price_gnf,
      buyer_id: user?.id,
      buyer_name: user?.name ?? "Visiteur",
      buyer_whatsapp: user?.whatsapp,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      seller_whatsapp: product.seller_whatsapp,
      message: msg,
      status: "ouverte",
    };

    upsertConversation.mutate(conversation, {
      onSuccess: () => {
        window.open(contactUrl, "_blank", "noopener,noreferrer");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> 
            Retour aux annonces
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] xl:gap-16">
          {/* Left Column: Image */}
          <div className="relative flex flex-col gap-4">
            <div className="group relative overflow-hidden rounded-3xl border bg-muted/30 shadow-2xl shadow-primary/5 ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />
              <img
                src={product.image_url}
                alt={product.title}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md">
                  <Tag className="size-3.5 text-primary" />
                  {product.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md">
                  <MapPin className="size-3.5 text-primary" />
                  {product.city}
                </span>
              </div>
            </div>
            
            {/* Trust Badges under image on desktop */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-2">
               <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-4 backdrop-blur-sm">
                 <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                   <ShieldCheck className="size-5" />
                 </div>
                 <div className="text-sm">
                   <p className="font-semibold text-foreground">Transaction Sécurisée</p>
                   <p className="text-xs text-muted-foreground">Paiement à la remise</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-4 backdrop-blur-sm">
                 <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                   <Clock className="size-5" />
                 </div>
                 <div className="text-sm">
                   <p className="font-semibold text-foreground">Annonce Récente</p>
                   <p className="text-xs text-muted-foreground">Vérifiée par HaliMad</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl lg:leading-tight">
                  {product.title}
                </h1>
                <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
                  <Share2 className="size-4" />
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <span className="bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                  {formatGNF(product.price_gnf)}
                </span>
              </div>

              <div className="my-8 h-px w-full bg-gradient-to-r from-border via-border to-transparent"></div>

              <div className="prose prose-sm md:prose-base dark:prose-invert text-muted-foreground/90">
                <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            </div>

            {/* Seller Card & CTA */}
            <div className="mt-12 flex flex-col gap-4 rounded-3xl border bg-card/40 p-6 shadow-xl shadow-black/5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary ring-1 ring-primary/20">
                    {product.seller_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendu par</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{product.seller_name}</p>
                      {product.verified && (
                        <span title="Vendeur vérifié" className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                          <BadgeCheck className="size-3" /> Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Réf. Produit</p>
                  <p className="font-mono text-sm font-medium text-foreground/80">{product.code}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  size="lg"
                  className="group relative w-full overflow-hidden rounded-2xl bg-whatsapp text-whatsapp-foreground transition-all hover:bg-whatsapp/90 hover:shadow-lg hover:shadow-whatsapp/20"
                  onClick={contactSeller}
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    <MessageCircle className="size-5" /> 
                    Contacter le vendeur
                  </span>
                  <div className="absolute inset-0 -z-10 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {product.faq.length > 0 && (
          <div className="mx-auto mt-24 max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
              <p className="mt-2 text-muted-foreground">Tout ce que vous devez savoir sur ce produit</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border bg-card/50 shadow-sm backdrop-blur-sm">
              {product.faq.map((f, i) => (
                <div key={i} className="border-b last:border-none border-border/50">
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-accent/50"
                  >
                    <span className="font-semibold">{f.q}</span>
                    <div className={`ml-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 ${openIdx === i ? "rotate-180" : ""}`}>
                      <ChevronDown className="size-4" />
                    </div>
                  </button>
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{f.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

