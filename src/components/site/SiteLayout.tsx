import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Smartphone } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { settingsQuery } from "@/lib/shop";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
] as const;

function SearchBox({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: value.trim() || undefined } });
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search phones"
        placeholder="Search iPhone 13, Galaxy S23..."
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Smartphone className="size-5" />
          </span>
          <span className="font-display text-base font-bold leading-tight sm:text-lg">
            Warista <span className="text-brand">Electronics</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-72 lg:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <Button asChild variant="default" size="sm" className="hidden sm:inline-flex">
            <Link to="/shop">Browse phones</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-left">Menu</SheetTitle>
              <div className="mt-4 flex flex-col gap-3">
                <SearchBox onDone={() => setOpen(false)} />
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/shop"
                  search={{ brand: "iPhone" }}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  iPhones
                </Link>
                <Link
                  to="/shop"
                  search={{ brand: "Samsung" }}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Samsung
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-2 lg:hidden">
        <div className="mx-auto max-w-6xl">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);

  return (
    <footer className="mt-16 border-t border-border bg-primary-soft">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold">
            {settings?.business_name || "Warista Electronics"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            New &amp; used Samsung and iPhone devices, carefully checked and fairly priced.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Visit us</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings?.business_address || "Fargo, North Dakota"}
          </p>
          {settings?.business_hours ? (
            <p className="text-sm text-muted-foreground">{settings.business_hours}</p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <a
            href={`mailto:${settings?.business_email || "alimandera@gmail.com"}`}
            className="mt-2 block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {settings?.business_email || "alimandera@gmail.com"}
          </a>
          {settings?.business_phone ? (
            <p className="text-sm text-muted-foreground">{settings.business_phone}</p>
          ) : null}
          <Link
            to="/contact"
            className="mt-2 block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Send a message
          </Link>
        </div>
        <div>
          <p className="text-sm font-semibold">Payments accepted</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>PayPal</li>
            <li>CashApp</li>
            <li>Zelle</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings?.business_name || "Warista Electronics"} · Fargo, ND
        {" · "}
        <Link to="/admin/login" className="underline-offset-4 hover:underline">
          Owner login
        </Link>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
