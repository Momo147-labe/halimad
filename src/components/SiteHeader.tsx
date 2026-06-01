import { Link, useNavigate } from "@tanstack/react-router";
import { useSession, useSignOut } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { LogOut, Store, ShieldCheck, PlusCircle } from "lucide-react";

export function SiteHeader() {
  const { user, loading } = useSession();
  const signOut = useSignOut();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
            H
          </div>
          <div className="leading-tight">
            <div className="font-bold">HaliMad</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Marketplace Guinée</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary font-semibold" }}
          >
            Accueil
          </Link>
          <Link to="/sell" activeProps={{ className: "text-primary font-semibold" }}>
            Vendre
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" activeProps={{ className: "text-primary font-semibold" }}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : !user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
                <Link to="/sell">
                  <PlusCircle className="size-4" /> Vendre
                </Link>
              </Button>
              {user.role === "admin" && (
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                  <Link to="/admin">
                    <ShieldCheck className="size-4" /> Admin
                  </Link>
                </Button>
              )}
              <span className="hidden md:inline text-sm text-muted-foreground">
                <Store className="inline size-4 mr-1" />
                {user.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  signOut.mutate(undefined, {
                    onSuccess: () => {
                      navigate({ to: "/" });
                    },
                  });
                }}
                disabled={signOut.isPending}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
