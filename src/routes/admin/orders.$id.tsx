import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Copy, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminOrder } from "@/lib/admin";
import { ORDER_STATUSES, productTitle } from "@/lib/shop";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/orders/$id")({ component: AdminOrderDetail });

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useQuery({ queryKey: ["admin-order", id], queryFn: () => fetchAdminOrder(id) });

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update order."),
  });

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (isError || !order) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">Order could not be loaded.</div>;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="gap-2"><Link to="/admin/orders"><ArrowLeft className="size-4" /> Back to orders</Link></Button>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order request</p><h2 className="mt-1 text-2xl font-bold">{order.id.slice(0, 8).toUpperCase()}</h2></div><Select value={order.status} onValueChange={(value) => mutation.mutate(value)} disabled={mutation.isPending}><SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger><SelectContent>{ORDER_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><UserRound className="size-5" /> Customer</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Info label="Name" value={order.buyer_name} /><Info label="Email" value={order.buyer_email} copy={() => copy(order.buyer_email)} /><Info label="Phone" value={order.buyer_phone} copy={() => copy(order.buyer_phone)} /><Info label="Shipping address" value={order.shipping_address} /><Info label="Notes" value={order.notes || "No notes"} /></CardContent></Card>
        <Card className="shadow-card"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="size-5" /> Request details</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Info label="Product" value={order.product ? productTitle(order.product) : "Product unavailable"} /><Info label="Price" value={order.product ? formatPrice(order.product.price) : "—"} /><Info label="Payment method" value={order.payment_method} /><Info label="Created" value={new Date(order.created_at).toLocaleString()} /></CardContent></Card>
      </div>
    </div>
  );
}

function Info({ label, value, copy }: { label: string; value: string; copy?: () => void }) {
  return <div><div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</div><div className="mt-1 flex items-center justify-between gap-3 font-medium"><span className="whitespace-pre-wrap">{value}</span>{copy && <button onClick={copy} aria-label={`Copy ${label}`} className="text-muted-foreground hover:text-foreground"><Copy className="size-4" /></button>}</div></div>;
}
