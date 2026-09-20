import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertTriangle, ImageOff, Pencil, Plus, Trash2, UploadCloud, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS, CONDITIONS, STOCK_STATUSES, productTitle, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/format";
import { fetchAdminProducts, uploadProductImages } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/listings")({
  component: AdminListings,
});

const emptyForm = {
  brand: "iPhone",
  model: "",
  storage: "",
  color: "",
  condition: "New",
  price: "",
  description: "",
  battery_health: "",
  stock_status: "Active",
};

function AdminListings() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<"newest" | "price-high" | "price-low">("newest");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const next = [...products];
    if (order === "price-high") next.sort((a, b) => Number(b.price) - Number(a.price));
    if (order === "price-low") next.sort((a, b) => Number(a.price) - Number(b.price));
    return next.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [products, order]);

  const createProductMutation = useMutation({
    mutationFn: async () => {
      setBusy(true);
      const payload = {
        brand: form.brand,
        model: form.model.trim(),
        storage: form.storage.trim() || null,
        color: form.color.trim() || null,
        condition: form.condition,
        price: Number(form.price),
        description: form.description.trim() || null,
        battery_health: form.battery_health ? Number(form.battery_health) : null,
        stock_status: form.stock_status,
        featured: false,
      };

      if (!payload.model) throw new Error("Model is required.");
      if (!Number.isFinite(payload.price) || payload.price <= 0) throw new Error("Price must be greater than zero.");

      const { data: created, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) throw new Error(error.message);

      if (selectedFiles.length) {
        await uploadProductImages(created.id, selectedFiles);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Phone listing created.");
      setForm(emptyForm);
      setSelectedFiles([]);
      setShowForm(false);
      setBusy(false);
    },
    onError: (error) => {
      setBusy(false);
      toast.error(error instanceof Error ? error.message : "Unable to create listing.");
    },
  });

  async function handleDeleteProduct(id: string) {
    if (!window.confirm("Delete this listing? This action cannot be undone.")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Listing deleted.");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  async function handleToggleStatus(productId: string, stock_status: string) {
    const next = stock_status === "Active" ? "Reserved" : "Active";
    const { error } = await supabase.from("products").update({ stock_status: next }).eq("id", productId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Stock status updated.");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  }

  const removeSelectedImage = (index: number) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Inventory control</p>
          <h2 className="mt-1 text-2xl font-bold">Phone inventory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, price, and publish every device from one workspace.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)} className="gap-2">
          <Plus className="size-4" /> {showForm ? "Close form" : "Add new phone"}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Create a listing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Brand</Label>
                <Select value={form.brand} onValueChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{BRANDS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model</Label>
                <Input className="mt-1.5" value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} />
              </div>
              <div>
                <Label>Storage</Label>
                <Input className="mt-1.5" value={form.storage} onChange={(e) => setForm((prev) => ({ ...prev, storage: e.target.value }))} placeholder="256GB" />
              </div>
              <div>
                <Label>Color</Label>
                <Input className="mt-1.5" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} placeholder="Blue" />
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(value) => setForm((prev) => ({ ...prev, condition: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" className="mt-1.5" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="699" />
              </div>
              <div>
                <Label>Battery health %</Label>
                <Input type="number" className="mt-1.5" value={form.battery_health} onChange={(e) => setForm((prev) => ({ ...prev, battery_health: e.target.value }))} placeholder="98" />
              </div>
              <div>
                <Label>Stock status</Label>
                <Select value={form.stock_status} onValueChange={(value) => setForm((prev) => ({ ...prev, stock_status: value }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{STOCK_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Description</Label>
              <Textarea className="mt-1.5 min-h-28" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe condition, included accessories, battery and any notes." />
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
              <Label className="flex items-center gap-2 text-sm font-medium"><UploadCloud className="size-4" /> Upload photos</Label>
              <Input type="file" multiple accept="image/*" className="mt-3" onChange={handleUpload} />
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 text-xs">
                      <span className="max-w-28 truncate">{file.name}</span>
                      <button type="button" onClick={() => removeSelectedImage(index)} className="text-destructive">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={() => createProductMutation.mutate()} disabled={busy || uploading}>
                {busy ? "Saving…" : "Save listing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Live stock</p><CardTitle className="mt-1 text-xl">Current inventory</CardTitle></div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <select value={order} onChange={(e) => setOrder(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm">
              <option value="newest">Newest</option>
              <option value="price-high">Price: high to low</option>
              <option value="price-low">Price: low to high</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive">We couldn’t load the product list.</div>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                          {product.product_images?.[0]?.url ? (
                            <img src={product.product_images[0].url} alt={product.model} className="size-full object-cover" />
                          ) : (
                            <ImageOff className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{productTitle(product)}</div>
                          <div className="text-xs text-muted-foreground">{product.brand}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.condition}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(product.id, product.stock_status)}
                        className={
                          product.stock_status === "Active"
                            ? "rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success"
                            : product.stock_status === "Reserved"
                              ? "rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning-foreground"
                              : "rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                        }
                      >
                        {product.stock_status}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/listings/${product.id}`} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium hover:bg-accent">
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                        <button onClick={() => handleDeleteProduct(product.id)} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedProducts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">No listings yet. Add your first phone above.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
