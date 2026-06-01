import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignUp } from "@/lib/hooks";
import { GUINEA_CITIES, type Role } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Inscription — HaliMad" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [role, setRole] = useState<Role>("acheteur");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    city: GUINEA_CITIES[0],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp.mutate(
      { 
        email: form.email, 
        password: form.password, 
        name: form.name, 
        role, 
        whatsapp: role === "vendeur" ? form.whatsapp : undefined, 
        city: form.city 
      },
      {
        onSuccess: () => {
          toast.success("Compte créé avec succès !");
          navigate({ to: role === "vendeur" ? "/sell" : "/" });
        },
        onError: (error) => {
          toast.error(error.message || "Erreur lors de la création du compte");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Créer un compte</h1>
      <p className="mt-1 text-muted-foreground">Choisissez votre rôle pour commencer.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {(
          [
            { v: "acheteur", icon: ShoppingBag, label: "Acheteur", d: "Parcourir et acheter" },
            { v: "vendeur", icon: Store, label: "Vendeur", d: "Publier des produits" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setRole(o.v)}
            className={`rounded-xl border p-4 text-left transition ${role === o.v ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:bg-muted"}`}
          >
            <o.icon
              className={`size-6 ${role === o.v ? "text-primary" : "text-muted-foreground"}`}
            />
            <div className="mt-2 font-semibold">{o.label}</div>
            <div className="text-xs text-muted-foreground">{o.d}</div>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <Label>Nom complet</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {role === "vendeur" && (
          <div>
            <Label>WhatsApp (ex 224620000000)</Label>
            <Input
              required
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
        )}
        <div>
          <Label>Ville</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            {GUINEA_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={signUp.isPending}>
          {signUp.isPending ? "Création..." : "Créer mon compte"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-primary underline">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}
