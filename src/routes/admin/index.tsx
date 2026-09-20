import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleAlert, MessageSquareText, PackageCheck, ShoppingCart, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminMessages, fetchAdminOrders, fetchAdminProducts } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function StatCard({ title, value, hint, icon: Icon }: { title: string; value: string; hint: string; icon: typeof PackageCheck }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function AdminOverview() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });
  const { data: messages, isLoading: messagesLoading, isError: messagesError } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchAdminMessages,
  });

  const activeListings = products?.filter((item) => item.stock_status === "Active").length ?? 0;
  const pendingOrders = orders?.filter((item) => item.status === "Pending Payment").length ?? 0;
  const unreadMessages = messages?.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-primary-foreground/15" />
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand"><Sparkles className="size-3.5" /> Owner overview</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Keep the shop moving.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/70">Your inventory, payment requests, and customer conversations in one place.</p>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {productsLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard title="Active listings" value={String(activeListings)} hint="Currently available in the shop" icon={PackageCheck} />
            <StatCard title="Pending orders" value={String(pendingOrders)} hint="Waiting on payment or shipping" icon={ShoppingCart} />
            <StatCard title="Unread messages" value={String(unreadMessages)} hint="New contact requests" icon={MessageSquareText} />
          </>
        )}
      </div>

      {(productsError || ordersError || messagesError) && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          One or more dashboard stats could not be loaded right now.
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Quick actions</p>
            <CardTitle className="mt-2 text-xl">Keep the shop moving</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button asChild variant="default" className="h-auto justify-between py-3">
            <a href="/admin/listings">Manage listings <ArrowRight className="ml-2 size-4" /></a>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-between py-3">
            <a href="/admin/orders">Review orders <ArrowRight className="ml-2 size-4" /></a>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-between py-3">
            <a href="/admin/messages">Respond to messages <ArrowRight className="ml-2 size-4" /></a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
