import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { ExternalLink, LayoutGrid, List, LogOut, MessageSquareText, Settings, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/admin/listings", label: "Listings", icon: List, exact: false },
  { to: "/admin/orders", label: "Orders", icon: Smartphone, exact: false },
  { to: "/admin/messages", label: "Messages", icon: MessageSquareText, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-64 shrink-0 flex-col rounded-3xl bg-sidebar p-4 text-sidebar-foreground shadow-lift lg:flex">
          <div className="flex items-center gap-3 border-b border-sidebar-border pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Smartphone className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Warista</p>
              <p className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Owner admin
              </p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1.5">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="space-y-2 border-t border-sidebar-border pt-4">
            <Button asChild variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Link to="/"><ExternalLink className="size-4" /> View storefront</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/admin/login" });
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 rounded-3xl border border-border bg-card px-4 py-4 shadow-card sm:mb-6 sm:px-5">
            <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Owner workspace
              </p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">Warista Electronics</h1>
            </div>
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary lg:hidden"><Smartphone className="size-4" /></div>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(({ to, label, icon: Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact }}
                  activeProps={{ className: "border-primary bg-primary text-primary-foreground" }}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-3.5" /> {label}
                </Link>
              ))}
            </nav>
          </header>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
