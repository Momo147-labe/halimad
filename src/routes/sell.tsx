import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useCreateProduct, useUploadImage } from "@/lib/hooks";
import {
  generateTrackingCode,
  GUINEA_CITIES,
  CATEGORIES,
  type Product,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Copy,
  ImagePlus,
  Plus,
  Trash2,
  ShoppingBag,
  MapPin,
  Tag,
  Phone,
  User,
  FileText,
  BadgeDollarSign,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Vendre un produit — HaliMad" },
      { name: "description", content: "Publiez votre annonce gratuitement sur HaliMad et trouvez un acheteur rapidement en Guinée." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const uploadImage = useUploadImage();
  const [submitted, setSubmitted] = useState<{ code: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priceGNF: "",
    city: GUINEA_CITIES[0],
    category: CATEGORIES[0],
    imageUrl: "",
    sellerName: user?.name ?? "",
    sellerWhatsapp: user?.whatsapp ?? "",
  });
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([{ q: "", a: "" }]);

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const updateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choisissez une image valide.");
      e.target.value = "";
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Image trop lourde. Choisissez une photo de moins de 2 Mo.");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImagePreview(result);
        setForm((f) => ({ ...f, imageUrl: result }));
      }
    };
    reader.onerror = () => toast.error("Impossible de lire cette image.");
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const price = Number(form.priceGNF);
    if (!form.title.trim() || !form.description.trim() || isNaN(price) || price <= 0) {
      toast.error("Merci de remplir tous les champs requis.");
      return;
    }
    if (!/^\d{8,15}$/.test(form.sellerWhatsapp.replace(/\D/g, ""))) {
      toast.error("Numéro WhatsApp invalide (ex : 224620000000).");
      return;
    }

    setIsSubmitting(true);
    const code = generateTrackingCode();
    let imageUrl = form.imageUrl.trim();

    if (imageFile) {
      try {
        imageUrl = await uploadImage.mutateAsync({ file: imageFile, userId: user.id });
      } catch {
        toast.error("Erreur lors de l'upload de l'image");
        setIsSubmitting(false);
        return;
      }
    } else {
      imageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800";
    }

    const product: Omit<Product, "id" | "created_at"> = {
      code,
      title: form.title.trim(),
      description: form.description.trim(),
      price_gnf: price,
      city: form.city,
      category: form.category,
      image_url: imageUrl,
      seller_id: user.id,
      seller_name: form.sellerName.trim(),
      seller_whatsapp: form.sellerWhatsapp.replace(/\D/g, ""),
      verified: false,
      status: "en_attente",
      faq: faq.filter((f) => f.q.trim() && f.a.trim()),
    };

    try {
      await createProduct.mutateAsync(product);
      setSubmitted({ code });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer le produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Succès ─── */
  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-success/10 via-background to-background" />
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-success/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-success/20" />
            <CheckCircle2 className="relative size-12 text-success" />
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
            Annonce envoyée !
          </h1>
          <p className="mt-3 max-w-sm text-lg text-muted-foreground">
            Votre annonce est en cours de validation. Notre équipe l'examinera très bientôt.
          </p>

          <div className="mt-8 w-full rounded-3xl border bg-card p-8 shadow-lg shadow-success/5">
            <div className="text-sm font-medium text-muted-foreground">Votre code de suivi</div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-bold tracking-wider text-primary">
                {submitted.code}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  navigator.clipboard.writeText(submitted.code);
                  toast.success("Code copié !");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Conservez ce code pour suivre l'état de validation de votre annonce.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full px-8"
              onClick={() => navigate({ to: "/" })}
            >
              Retour à l'accueil <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => {
                setSubmitted(null);
                setImagePreview("");
                setForm({ ...form, title: "", description: "", priceGNF: "", imageUrl: "" });
              }}
            >
              Publier une autre annonce
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Formulaire ─── */
  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24">
      {/* Background décoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[80px]" />

      {/* Header de la page */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Sparkles className="size-3.5" />
          Publication gratuite
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
          Publiez votre annonce
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          Remplissez les informations ci-dessous. Votre annonce sera visible après validation par notre équipe.
        </p>

        {/* Banner connexion requis */}
        {!loading && !user && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4">
            <Lock className="size-5 shrink-0 text-warning-foreground" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">Connexion requise</span> — Vous devez être connecté pour publier une annonce.
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-warning/40 text-sm"
              onClick={() => navigate({ to: "/login" })}
            >
              Se connecter
            </Button>
          </div>
        )}
      </section>

      {/* Formulaire principal */}
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 px-4">

        {/* Bloc 1 : Infos produit */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Informations du produit</h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-sm font-semibold">Titre de l'annonce *</Label>
              <Input
                className="mt-2 h-12 rounded-xl"
                value={form.title}
                onChange={update("title")}
                placeholder="Ex : iPhone 13 Pro 256 Go — Parfait état"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Description *</Label>
              <Textarea
                className="mt-2 rounded-xl"
                value={form.description}
                onChange={update("description")}
                rows={5}
                placeholder="Décrivez votre article en détail : état, accessoires inclus, raison de la vente..."
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <BadgeDollarSign className="size-4 text-primary" /> Prix (GNF) *
                </Label>
                <Input
                  className="mt-2 h-12 rounded-xl"
                  type="number"
                  min={1}
                  value={form.priceGNF}
                  onChange={update("priceGNF")}
                  placeholder="Ex : 5000000"
                  required
                />
              </div>

              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="size-4 text-primary" /> Ville *
                </Label>
                <select
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.city}
                  onChange={update("city")}
                >
                  {GUINEA_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Tag className="size-4 text-primary" /> Catégorie *
                </Label>
                <select
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.category}
                  onChange={update("category")}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <Label htmlFor="product-image" className="text-sm font-semibold">
                  Photo du produit
                </Label>
                <label
                  htmlFor="product-image"
                  className="mt-2 flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <ImagePlus className="size-5" />
                  {imagePreview ? "Photo choisie ✓" : "Choisir une photo"}
                </label>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={updateImage}
                  className="sr-only"
                />
              </div>
            </div>

            {/* Aperçu image */}
            {imagePreview && (
              <div className="relative overflow-hidden rounded-2xl border">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="h-64 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(""); setImageFile(null); setForm(f => ({ ...f, imageUrl: "" })); }}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bloc 2 : Infos vendeur */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Vos coordonnées</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <User className="size-4 text-primary" /> Nom du vendeur *
              </Label>
              <Input
                className="mt-2 h-12 rounded-xl"
                value={form.sellerName}
                onChange={update("sellerName")}
                placeholder="Votre prénom et nom"
                required
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Phone className="size-4 text-primary" /> WhatsApp (avec indicatif) *
              </Label>
              <Input
                className="mt-2 h-12 rounded-xl"
                value={form.sellerWhatsapp}
                onChange={update("sellerWhatsapp")}
                placeholder="224620000000"
                required
              />
            </div>
          </div>
        </div>

        {/* Bloc 3 : FAQ optionnel */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">FAQ</h2>
                <p className="text-sm text-muted-foreground">Questions/réponses sur votre produit (optionnel)</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5"
              onClick={() => setFaq([...faq, { q: "", a: "" }])}
            >
              <Plus className="size-3.5" /> Ajouter
            </Button>
          </div>

          <div className="space-y-3">
            {faq.map((f, i) => (
              <div key={i} className="grid items-start gap-3 rounded-2xl bg-muted/40 p-4 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Question</Label>
                  <Input
                    className="mt-1 h-10 rounded-xl"
                    placeholder="Ex : Est-il encore sous garantie ?"
                    value={f.q}
                    onChange={(e) =>
                      setFaq(faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Réponse</Label>
                  <Input
                    className="mt-1 h-10 rounded-xl"
                    placeholder="Votre réponse..."
                    value={f.a}
                    onChange={(e) =>
                      setFaq(faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFaq(faq.filter((_, j) => j !== i))}
                  className="mt-6 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="rounded-3xl border bg-primary/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">
              En publiant, vous confirmez que votre annonce est conforme à nos règles. Chaque annonce est vérifiée manuellement avant publication — comptez moins de 24h.
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full rounded-2xl py-6 text-lg font-bold"
            disabled={isSubmitting || (!loading && !user)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Publication en cours…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Publier l'annonce gratuitement <ArrowRight className="size-5" />
              </span>
            )}
          </Button>
          {!loading && !user && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-primary underline">Connectez-vous</Link> ou{" "}
              <Link to="/register" className="font-semibold text-primary underline">créez un compte</Link> d'abord.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
