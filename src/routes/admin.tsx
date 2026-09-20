import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login" || location.pathname === "/admin/reset-password") return;

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw redirect({ to: "/admin/login" });
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .maybeSingle();

    if (roleError || !roleData || roleData.role !== "admin") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminShell,
});
