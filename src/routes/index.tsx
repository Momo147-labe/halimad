import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProducts } from "@/lib/hooks";
import { GUINEA_CITIES, CATEGORIES } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  Tv,
  Shirt,
  Car,
  Home as HomeIcon,
  Coffee,
  Sparkles,
  Briefcase,
  MapPin,
  Tag,
  ArrowRight,
  CheckCircle2,
  Phone,
  Handshake,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HaliMad — Marketplace Premium en Guinée" },
      {
        name: "description",
        content:
          "Achetez et vendez partout en Guinée avec sécurité et simplicité. Filtrez par ville, contactez les vendeurs sur WhatsApp, prix en GNF.",
      },
    ],
  }),
  component: Home,
});

const categoryIcons: Record<string, any> = {
  Téléphones: Smartphone,
  Électroménager: Tv,
  Mode: Shirt,
  Voitures: Car,
  Immobilier: HomeIcon,
  Alimentation: Coffee,
  Beauté: Sparkles,
  Services: Briefcase,
};

function Home() {
  const { data: products = [], isLoading } = useProducts();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Toutes");
  const [cat, setCat] = useState("Toutes");

  const visible = useMemo(() => {
    return products.filter(
      (p) =>
        (p.status === "valide" || p.status === "vendu") &&
        (city === "Toutes" || p.city === city) &&
        (cat === "Toutes" || p.category === cat) &&
        (q.trim() === "" ||
          (p.title + " " + p.description).toLowerCase().includes(q.toLowerCase())),
    );
  }, [products, q, city, cat]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="animate-pulse text-lg font-medium text-muted-foreground">
            Chargement des annonces...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Hero Section avec Glassmorphism */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-accent/10"></div>
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"></div>
        <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-[80px]"></div>

        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            La plateforme n°1 en Guinée
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl">
            Achetez et vendez <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              en toute simplicité
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Découvrez des milliers d'annonces vérifiées près de chez vous. Vendez
            rapidement ou trouvez la perle rare, sans frais cachés.
          </p>

          {/* Global Search Bar inside Hero */}
          <div className="mx-auto mt-10 max-w-3xl">
            <div className="grid gap-3 rounded-2xl border bg-background/60 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl md:grid-cols-[1fr_auto_auto]">
              <div className="relative flex items-center">
                <Search className="absolute left-4 size-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Que recherchez-vous ?"
                  className="h-14 w-full rounded-xl border-none bg-transparent pl-12 text-lg shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 border-t pt-3 md:border-l md:border-t-0 md:pl-3 md:pt-0">
                <MapPin className="size-5 text-muted-foreground" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-14 w-full rounded-xl border-none bg-transparent px-3 text-sm font-medium outline-none cursor-pointer"
                >
                  <option value="Toutes">Toutes les villes</option>
                  {GUINEA_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 border-t pt-3 md:border-l md:border-t-0 md:pl-3 md:pt-0">
                <Tag className="size-5 text-muted-foreground" />
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="h-14 w-full rounded-xl border-none bg-transparent px-3 text-sm font-medium outline-none cursor-pointer"
                >
                  <option value="Toutes">Toutes catégories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catégories en Vedette */}
      <section className="mx-auto max-w-6xl px-4 -mt-16 relative z-10">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6">
          <button
            onClick={() => setCat("Toutes")}
            className={`group flex min-w-[120px] flex-col items-center justify-center gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
              cat === "Toutes" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent/50"
            }`}
          >
            <div className="rounded-full bg-background/20 p-3 backdrop-blur-sm">
              <ShoppingBag className="size-6" />
            </div>
            <span className="text-sm font-semibold">Tout voir</span>
          </button>
          
          {CATEGORIES.map((c) => {
            const Icon = categoryIcons[c] || ShoppingBag;
            const isSelected = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`group flex min-w-[120px] snap-center flex-col items-center justify-center gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/50 hover:bg-accent/20"
                }`}
              >
                <div className={`rounded-full p-3 transition-colors ${isSelected ? "bg-background/20" : "bg-secondary group-hover:bg-primary/10 group-hover:text-primary"}`}>
                  <Icon className="size-6" />
                </div>
                <span className="text-sm font-semibold">{c}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Section Produits */}
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Annonces récentes</h2>
            <p className="mt-1 text-muted-foreground">
              {visible.length} résultat{visible.length > 1 ? "s" : ""} trouvé{visible.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/30 p-16 text-center backdrop-blur-sm">
            <div className="rounded-full bg-background p-4 shadow-sm">
              <Search className="size-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Aucun produit trouvé</h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Nous n'avons trouvé aucune annonce correspondant à vos critères. Essayez
              de modifier vos filtres ou de chercher autre chose.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full"
              onClick={() => { setQ(""); setCity("Toutes"); setCat("Toutes"); }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <div key={p.id} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Comment ça marche */}
      <section className="mx-auto mt-32 max-w-6xl px-4">
        <div className="rounded-3xl bg-secondary/30 p-8 md:p-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Comment ça marche ?</h2>
            <p className="mt-3 text-muted-foreground">Vendre et acheter n'a jamais été aussi simple sur HaliMad.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Search className="size-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">1. Cherchez</h3>
              <p className="mt-2 text-muted-foreground">Parcourez des milliers d'annonces ou utilisez notre barre de recherche magique.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp">
                <Phone className="size-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">2. Contactez</h3>
              <p className="mt-2 text-muted-foreground">Discutez directement avec le vendeur via WhatsApp en un seul clic, sans intermédiaire.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                <Handshake className="size-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">3. Concluez</h3>
              <p className="mt-2 text-muted-foreground">Rencontrez-vous, vérifiez l'article et finalisez la transaction en toute sécurité.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust / Sécurité */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              t: "Vendeurs vérifiés",
              d: "Chaque produit est validé par notre équipe avant d'être mis en ligne pour éviter les fraudes.",
            },
            {
              icon: CheckCircle2,
              t: "Modération Active",
              d: "Une communauté sûre grâce à un suivi régulier et une tolérance zéro pour les arnaques.",
            },
            {
              icon: ShoppingBag,
              t: "100% Gratuit",
              d: "Créer un compte et publier une annonce ne vous coûtera jamais un seul franc guinéen.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="group relative overflow-hidden rounded-3xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="absolute right-0 top-0 -mr-4 -mt-4 size-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150"></div>
              <Icon className="relative z-10 size-8 text-primary" />
              <h3 className="relative z-10 mt-5 text-xl font-semibold">{t}</h3>
              <p className="relative z-10 mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Prêt à faire de bonnes affaires ?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Rejoignez des milliers de Guinéens qui achètent et vendent quotidiennement sur HaliMad.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8 text-base">
              <Link to="/sell">
                Publier une annonce <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/20 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
