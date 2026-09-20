import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronRight, CircleDollarSign, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Sales pipeline</p><h2 className="mt-1 text-2xl font-bold">Order requests</h2><p className="mt-1 text-sm text-muted-foreground">Track payment, fulfillment, and customer details.</p></div>
        <div className="rounded-xl bg-primary px-4 py-3 text-primary-foreground"><p className="text-2xl font-bold leading-none">{data?.length ?? "—"}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">total requests</p></div>
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Recent requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive">Orders couldn’t be loaded.</div>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.buyer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.buyer_email}</div>
                    </TableCell>
                    <TableCell>
                      {order.product ? (
                        <div>
                          <div className="font-medium">{order.product.model}</div>
                          <div className="text-xs text-muted-foreground">{order.product.storage ?? "—"}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}
                    </TableCell>
                    <TableCell>{order.payment_method}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-brand/12 px-2 py-1 text-xs font-medium text-brand">{order.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1">
                          View
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">No order requests yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
