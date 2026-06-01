import { Link, useNavigate } from "@tanstack/react-router";
import { useSession, useSignOut } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { LogOut, Store, ShieldCheck, PlusCircle, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function SiteHeader() {
  const { user, loading } = useSession();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        
        {/* Mobile menu trigger and logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="size-5" />
                <span className="sr-only">Menu principal</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex items-center gap-2 mb-8">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
                  H
                </div>
                <div className="font-bold leading-tight">HaliMad</div>
              </div>
              <nav className="flex flex-col gap-6 text-sm">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  activeProps={{ className: "text-primary font-semibold" }}
                  className="hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
                <Link 
                  to="/sell" 
                  onClick={() => setIsOpen(false)}
                  activeProps={{ className: "text-primary font-semibold" }}
                  className="hover:text-primary transition-colors"
                >
                  Vendre
                </Link>
                {user?.role === "admin" && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    activeProps={{ className: "text-primary font-semibold" }}
                    className="hover:text-primary transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              H
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-bold">HaliMad</div>
              <div className="text-xs text-muted-foreground -mt-0.5">Marketplace Guinée</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
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

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : !user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="secondary" className="hidden lg:inline-flex">
                <Link to="/sell">
                  <PlusCircle className="size-4 mr-1" /> Vendre
                </Link>
              </Button>
              {user.role === "admin" && (
                <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
                  <Link to="/admin">
                    <ShieldCheck className="size-4 mr-1" /> Admin
                  </Link>
                </Button>
              )}
              <span className="hidden sm:inline text-sm text-muted-foreground mr-1">
                <Store className="inline size-4 mr-1" />
                {user.name.split(' ')[0]}
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
                title="Déconnexion"
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
