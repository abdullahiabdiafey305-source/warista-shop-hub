import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MapPin, Wallet } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/shop";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Warista Electronics — Fargo, ND" },
      {
        name: "description",
        content:
          "Questions about a phone? Message Warista Electronics in Fargo, North Dakota. PayPal, CashApp and Zelle accepted.",
      },
      { property: "og:title", content: "Contact Warista Electronics" },
      {
        property: "og:description",
        content: "Reach the Warista Electronics team in Fargo, North Dakota.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: settings } = useQuery(settingsQuery);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Message sent — we'll reply by email soon.");
      setForm({ name: "", email: "", message: "" });
      setSent(true);
    },
    onError: (e: Error) => toast.error(e.message || "Could not send your message."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next['name'] = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next['email'] = "Please enter a valid email address.";
    if (form.message.trim().length < 10) next['message'] = "Please write at least a sentence.";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate();
  }

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-3xl font-bold">Get in touch</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask about a listing, request photos, or tell us what you're looking for.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
                required
              />
              {errors['name'] && <p className="mt-1 text-xs text-destructive">{errors['name']}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
                required
              />
              {errors['email'] && <p className="mt-1 text-xs text-destructive">{errors['email']}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                required
              />
              {errors['message'] && (
                <p className="mt-1 text-xs text-destructive">{errors['message']}</p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Send message"}
            </Button>
            {sent && (
              <p className="text-sm text-success">
                Thanks! Your message is with Warista Electronics.
              </p>
            )}
          </form>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-primary-soft p-6">
          <p className="font-display text-lg font-bold">
            {settings?.business_name || "Warista Electronics"}
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>{settings?.business_address || "Fargo, North Dakota"}</span>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
              <a
                href={`mailto:${settings?.business_email || "alimandera@gmail.com"}`}
                className="underline-offset-4 hover:underline"
              >
                {settings?.business_email || "alimandera@gmail.com"}
              </a>
            </p>
            <p className="flex gap-3">
              <Wallet className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>Payments accepted: PayPal, CashApp, Zelle</span>
            </p>
          </div>
          {settings?.business_hours && (
            <p className="mt-5 text-sm text-muted-foreground">{settings.business_hours}</p>
          )}
        </aside>
      </div>
    </SiteLayout>
  );
}
