import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, LogOut, MessageSquareText, Settings, Smartphone } from "lucide-react";

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
    <div className="min-h-screen bg-muted/20 text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-border bg-card p-4 shadow-card lg:block">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Smartphone className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Warista</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Owner admin
              </p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
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
          <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">Warista Electronics</h1>
            </div>
            <div className="lg:hidden">
              <nav className="flex flex-wrap gap-2">
                {navItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
