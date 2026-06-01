import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — HaliMad" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          toast.success("Connexion réussie");
          // Navigate based on user role (we'll need to fetch profile)
          navigate({ to: "/" });
        },
        onError: (error) => {
          toast.error("Identifiants incorrects");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <p className="mt-1 text-muted-foreground">Accédez à votre compte HaliMad.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={signIn.isPending}>
          {signIn.isPending ? "Connexion..." : "Se connecter"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Pas de compte ?{" "}
          <Link to="/register" className="text-primary underline">
            S'inscrire
          </Link>
        </div>
      </form>
    </div>
  );
}
