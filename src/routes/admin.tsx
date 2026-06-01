import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  useSession,
  useProducts,
  useConversations,
  useUpdateProduct,
  useUpdateConversation,
} from "@/lib/hooks";
import {
  formatGNF,
  whatsappUrl,
  type Conversation,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  MessageCircle,
  Clock,
  BadgeCheck,
  Handshake,
  ReceiptText,
  Search,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — HaliMad" }] }),
  component: Admin,
});

function Admin() {
  const { user, loading } = useSession();
  const { data: products = [] } = useProducts();
  const { data: conversations = [] } = useConversations();
  const updateProduct = useUpdateProduct();
  const updateConversation = useUpdateConversation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user === null) {
      navigate({ to: "/login" });
      return;
    }
    if (!loading && user && user.role !== "admin") navigate({ to: "/" });
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== "admin") return null;

  const pending = products.filter((p) => p.status === "en_attente");
  const validated = products.filter((p) => p.status === "valide");
  const rejected = products.filter((p) => p.status === "rejete");
  const sold = products.filter((p) => p.status === "vendu");
  const activeConversations = conversations.filter((c) => c.status === "ouverte");
  const confirmedSales = conversations.filter((c) => c.status === "vente_confirmee");

  const approve = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    updateProduct.mutate(
      { id, patch: { status: "valide", verified: true } },
      {
        onSuccess: () => {
          toast.success("Produit validé");
          const msg = `Bonjour ${p.seller_name}, votre produit "${p.title}" (code ${p.code}) a été validé sur HaliMad et est maintenant en ligne. ✅`;
          window.open(whatsappUrl(p.seller_whatsapp, msg), "_blank");
        },
      },
    );
  };

  const reject = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    updateProduct.mutate(
      { id, patch: { status: "rejete" } },
      {
        onSuccess: () => {
          toast("Produit rejeté");
          const msg = `Bonjour ${p.seller_name}, votre produit "${p.title}" (code ${p.code}) n'a pas été accepté sur HaliMad. Contactez-nous pour plus d'informations.`;
          window.open(whatsappUrl(p.seller_whatsapp, msg), "_blank");
        },
      },
    );
  };

  const confirmSale = (conversation: Conversation) => {
    updateConversation.mutate(
      {
        id: conversation.id,
        patch: {
          status: "vente_confirmee",
          confirmed_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          updateProduct.mutate(
            { id: conversation.product_id, patch: { status: "vendu" } },
            {
              onSuccess: () => {
                toast.success("Vente confirmée");
              },
            },
          );
        },
      },
    );
  };

  const cancelConversation = (conversation: Conversation) => {
    updateConversation.mutate(
      { id: conversation.id, patch: { status: "annulee" } },
      {
        onSuccess: () => {
          toast("Conversation annulée");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Tableau de bord Admin</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Validez les annonces, suivez les contacts acheteur-vendeur et confirmez les ventes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-card/50 px-4 py-2 shadow-sm backdrop-blur-md">
            <div className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-success"></span>
            </div>
            <span className="text-sm font-medium">Système en ligne</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={Clock} label="En attente" value={pending.length} tone="warning" />
          <Stat icon={BadgeCheck} label="Validés" value={validated.length} tone="success" />
          <Stat icon={X} label="Rejetés" value={rejected.length} tone="destructive" />
          <Stat
            icon={MessageCircle}
            label="Conversations"
            value={activeConversations.length}
            tone="info"
          />
          <Stat icon={ReceiptText} label="Ventes" value={confirmedSales.length} tone="success" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* À Valider */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Annonces à valider</h2>
                <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-bold text-warning-foreground">
                  {pending.length} en attente
                </span>
              </div>
              {pending.length === 0 ? (
                <EmptyState icon={BadgeCheck} title="Tout est à jour" description="Aucune annonce en attente de validation." />
              ) : (
                <div className="grid gap-4">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="group flex flex-col gap-4 rounded-2xl border bg-card/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                    >
                      <img src={p.image_url} alt="" className="aspect-square h-32 w-32 shrink-0 rounded-xl object-cover" />
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to="/product/$id"
                              params={{ id: p.id }}
                              className="text-lg font-bold hover:text-primary transition-colors line-clamp-1"
                            >
                              {p.title}
                            </Link>
                            <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                              {p.category}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {p.description}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                          <span className="font-extrabold text-primary text-lg">{formatGNF(p.price_gnf)}</span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{p.seller_name.charAt(0)}</div>
                            {p.seller_name}
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">Réf: {p.code}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        <Button
                          onClick={() => approve(p.id)}
                          className="w-full bg-success text-success-foreground hover:bg-success/90 shadow-sm"
                        >
                          <Check className="size-4 mr-1.5" /> Valider
                        </Button>
                        <Button onClick={() => reject(p.id)} variant="destructive" className="w-full shadow-sm">
                          <X className="size-4 mr-1.5" /> Rejeter
                        </Button>
                        <Button asChild variant="outline" className="w-full bg-background/50">
                          <a
                            href={whatsappUrl(
                              p.seller_whatsapp,
                              `Bonjour ${p.seller_name}, à propos de votre annonce ${p.code}…`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="size-4 mr-1.5 text-whatsapp" /> Contacter
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Conversations Ouvertes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Conversations en cours</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {activeConversations.length} actives
                </span>
              </div>
              {activeConversations.length === 0 ? (
                <EmptyState icon={MessageCircle} title="Aucune discussion" description="Il n'y a pas de mise en relation en cours." />
              ) : (
                <div className="grid gap-4">
                  {activeConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      action={
                        <>
                          <Button
                            onClick={() => confirmSale(conversation)}
                            className="bg-success text-success-foreground hover:bg-success/90 w-full"
                          >
                            <Handshake className="size-4 mr-1.5" /> Confirmer vente
                          </Button>
                          <Button onClick={() => cancelConversation(conversation)} variant="outline" className="w-full">
                            <X className="size-4 mr-1.5" /> Annuler
                          </Button>
                        </>
                      }
                    />
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Ventes confirmées */}
            <section className="rounded-3xl border bg-card/40 p-6 shadow-xl shadow-black/5 backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <ReceiptText className="size-5 text-success" />
                Dernières Ventes
              </h2>
              {confirmedSales.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">Aucune vente récente.</div>
              ) : (
                <div className="space-y-3">
                  {confirmedSales.slice(0, 5).map((conversation) => (
                    <div key={conversation.id} className="group relative overflow-hidden rounded-2xl bg-background/50 p-3 transition-colors hover:bg-accent/50 border">
                      <div className="flex items-center gap-3">
                        <img src={conversation.product_image_url} className="size-12 rounded-xl object-cover shadow-sm" alt="" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{conversation.product_title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {conversation.buyer_name} <span className="text-muted-foreground/50">acheté à</span> {conversation.seller_name}
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Validés (Aperçu) */}
            <section className="rounded-3xl border bg-card/40 p-6 shadow-xl shadow-black/5 backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <BadgeCheck className="size-5 text-primary" />
                Produits en ligne
              </h2>
              {validated.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">Aucun produit actif.</div>
              ) : (
                <div className="space-y-3">
                  {validated.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="group flex items-center gap-3 rounded-2xl bg-background/50 p-3 transition-colors hover:bg-accent/50 border"
                    >
                      <img src={p.image_url} className="size-10 rounded-lg object-cover shadow-sm" alt="" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold group-hover:text-primary transition-colors">{p.title}</div>
                        <div className="text-xs font-medium text-primary mt-0.5">{formatGNF(p.price_gnf)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
        <Icon className="size-8 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

function ConversationRow({
  conversation,
  action,
}: {
  conversation: Conversation;
  action?: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border bg-card/50 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md lg:flex-row">
      <img
        src={conversation.product_image_url}
        alt=""
        className="aspect-square h-24 w-24 shrink-0 rounded-xl object-cover shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/product/$id"
            params={{ id: conversation.product_id }}
            className="text-lg font-bold hover:text-primary transition-colors"
          >
            {conversation.product_title}
          </Link>
          <span className="rounded bg-secondary/80 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider">
            Réf: {conversation.product_code}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {formatGNF(conversation.price_gnf)}
          </span>
        </div>
        
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-xl border bg-background/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acheteur</span>
            </div>
            <div className="font-semibold">{conversation.buyer_name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {conversation.buyer_whatsapp ? conversation.buyer_whatsapp : "Pas de numéro"}
            </div>
          </div>
          <div className="rounded-xl border bg-background/50 p-3">
             <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vendeur</span>
            </div>
            <div className="font-semibold">{conversation.seller_name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{conversation.seller_whatsapp}</div>
          </div>
        </div>

        <div className="mt-4 relative rounded-xl bg-muted/50 p-4 text-sm text-foreground/90 italic border-l-2 border-l-primary">
          "{conversation.message}"
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="size-3" />
          Dernier contact le {new Date(conversation.last_message_at).toLocaleString("fr-FR")}
        </div>
      </div>
      {action && <div className="flex gap-2 shrink-0 lg:w-48 lg:flex-col justify-center border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4 mt-2 lg:mt-0">{action}</div>}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive" | "info";
}) {
  const tones = {
    success: "bg-success/15 text-success shadow-success/10",
    warning: "bg-warning/20 text-warning-foreground shadow-warning/10",
    info: "bg-primary/15 text-primary shadow-primary/10",
    destructive: "bg-destructive/15 text-destructive shadow-destructive/10",
  };
  
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={`absolute -right-4 -top-4 size-20 rounded-full opacity-20 blur-2xl transition-transform group-hover:scale-150 ${tones[tone].split(' ')[0]}`}></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className={`grid size-12 shrink-0 place-items-center rounded-2xl shadow-inner ${tones[tone]}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <div className="text-3xl font-black tracking-tighter">{value}</div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
