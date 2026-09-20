import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminSettings } from "@/lib/admin";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchAdminSettings });
  const [form, setForm] = useState({
    paypal_link: "",
    cashapp_tag: "",
    zelle_info: "",
    business_name: "",
    business_address: "",
    business_email: "",
    business_phone: "",
    business_hours: "",
    whatsapp_catalog_url: "",
  });
  const [password, setPassword] = useState("");
  const hydratedSettings = useRef(false);

  useEffect(() => {
    if (!data || hydratedSettings.current) return;

    setForm({
      paypal_link: data.paypal_link ?? "",
      cashapp_tag: data.cashapp_tag ?? "",
      zelle_info: data.zelle_info ?? "",
      business_name: data.business_name ?? "",
      business_address: data.business_address ?? "",
      business_email: data.business_email ?? "",
      business_phone: data.business_phone ?? "",
      business_hours: data.business_hours ?? "",
      whatsapp_catalog_url: data.whatsapp_catalog_url ?? "",
    });
    hydratedSettings.current = true;
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("settings")
        .update({
          paypal_link: form.paypal_link,
          cashapp_tag: form.cashapp_tag,
          zelle_info: form.zelle_info,
          business_name: form.business_name,
          business_address: form.business_address,
          business_email: form.business_email,
          business_phone: form.business_phone,
          business_hours: form.business_hours,
          whatsapp_catalog_url: form.whatsapp_catalog_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Store settings updated.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Password updated.");
      setPassword("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    },
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Store settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="text-sm text-destructive">Settings could not be loaded.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>PayPal.me link</Label>
                <Input className="mt-1.5" value={form.paypal_link} onChange={(e) => setForm((prev) => ({ ...prev, paypal_link: e.target.value }))} />
              </div>
              <div>
                <Label>CashApp tag</Label>
                <Input className="mt-1.5" value={form.cashapp_tag} onChange={(e) => setForm((prev) => ({ ...prev, cashapp_tag: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Zelle info</Label>
                <Input className="mt-1.5" value={form.zelle_info} onChange={(e) => setForm((prev) => ({ ...prev, zelle_info: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Business name</Label>
                <Input className="mt-1.5" value={form.business_name} onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Business address</Label>
                <Input className="mt-1.5" value={form.business_address} onChange={(e) => setForm((prev) => ({ ...prev, business_address: e.target.value }))} />
              </div>
              <div>
                <Label>Business email</Label>
                <Input type="email" className="mt-1.5" value={form.business_email} onChange={(e) => setForm((prev) => ({ ...prev, business_email: e.target.value }))} />
              </div>
              <div>
                <Label>Business phone</Label>
                <Input className="mt-1.5" value={form.business_phone} onChange={(e) => setForm((prev) => ({ ...prev, business_phone: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Business hours</Label>
                <Input className="mt-1.5" value={form.business_hours} onChange={(e) => setForm((prev) => ({ ...prev, business_hours: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>WhatsApp catalog URL</Label>
                <Input type="url" className="mt-1.5" placeholder="https://wa.me/c/..." value={form.whatsapp_catalog_url} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp_catalog_url: e.target.value }))} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Save settings</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Change admin password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-3">
            <Label>New password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <Button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending}>Update password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
