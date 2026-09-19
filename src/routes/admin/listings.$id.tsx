import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImageOff, Save, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminProduct, uploadProductImages } from "@/lib/admin";
import { BRANDS, CONDITIONS, STOCK_STATUSES, sortImages } from "@/lib/shop";

export const Route = createFileRoute("/admin/listings/$id")({ component: AdminListingDetail });

function AdminListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isLoading, isError } = useQuery({ queryKey: ["admin-product", id], queryFn: () => fetchAdminProduct(id) });
  const [form, setForm] = useState({ brand: "", model: "", storage: "", color: "", condition: "", price: "", description: "", battery_health: "", stock_status: "" });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!product) return;
    setForm({
      brand: product.brand,
      model: product.model,
      storage: product.storage ?? "",
      color: product.color ?? "",
      condition: product.condition,
      price: String(product.price),
      description: product.description ?? "",
      battery_health: product.battery_health == null ? "" : String(product.battery_health),
      stock_status: product.stock_status,
    });
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.model.trim()) throw new Error("Model is required.");
      const price = Number(form.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Price must be greater than zero.");
      const { error } = await supabase.from("products").update({
        brand: form.brand,
        model: form.model.trim(),
        storage: form.storage.trim() || null,
        color: form.color.trim() || null,
        condition: form.condition,
        price,
        description: form.description.trim() || null,
        battery_health: form.battery_health ? Number(form.battery_health) : null,
        stock_status: form.stock_status,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw new Error(error.message);
      if (files.length) await uploadProductImages(id, files);
    },
    onSuccess: () => {
      toast.success("Listing updated.");
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update listing."),
  });

  async function deleteImage(imageId: string) {
    if (!window.confirm("Delete this image?")) return;
    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) toast.error(error.message);
    else {
      toast.success("Image deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (isError || !product) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">Listing could not be loaded.</div>;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="gap-2"><Link to="/admin/listings"><ArrowLeft className="size-4" /> Back to listings</Link></Button>
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-xl">Edit listing</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand"><Select value={form.brand} onValueChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BRANDS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Model"><Input value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} /></Field>
            <Field label="Storage"><Input value={form.storage} onChange={(e) => setForm((prev) => ({ ...prev, storage: e.target.value }))} /></Field>
            <Field label="Color"><Input value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} /></Field>
            <Field label="Condition"><Select value={form.condition} onValueChange={(value) => setForm((prev) => ({ ...prev, condition: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONDITIONS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Price"><Input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} /></Field>
            <Field label="Battery health %"><Input type="number" value={form.battery_health} onChange={(e) => setForm((prev) => ({ ...prev, battery_health: e.target.value }))} /></Field>
            <Field label="Stock status"><Select value={form.stock_status} onValueChange={(value) => setForm((prev) => ({ ...prev, stock_status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STOCK_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <div className="mt-4"><Label>Description</Label><Textarea className="mt-1.5 min-h-28" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></div>
          <div className="mt-4 rounded-xl border border-dashed border-border p-4"><Label className="flex items-center gap-2"><UploadCloud className="size-4" /> Add photos</Label><Input type="file" multiple accept="image/*" className="mt-3" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} /></div>
          <div className="mt-5 flex justify-end"><Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2"><Save className="size-4" /> {saveMutation.isPending ? "Saving..." : "Save changes"}</Button></div>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-xl">Photos</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sortImages(product).map((image, index) => <div key={image.id} className="relative overflow-hidden rounded-xl border border-border"><div className="aspect-square bg-muted">{image.url ? <img src={image.url} alt={`${product.model} photo ${index + 1}`} className="size-full object-cover" /> : <ImageOff className="m-auto size-8" />}</div><div className="flex items-center justify-between p-2 text-xs"><span>{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span><button onClick={() => deleteImage(image.id)} className="text-destructive" aria-label="Delete photo"><Trash2 className="size-4" /></button></div></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}
